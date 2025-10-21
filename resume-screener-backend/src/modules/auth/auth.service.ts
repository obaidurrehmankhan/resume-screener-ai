// src/auth/auth.service.ts

import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { CookieOptions, Response } from 'express'
import { User } from '../user/user.entity'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { UserRole } from '../../common/enums/user-role.enum'
import { UserPayload } from './types/user-payload'

const ACCESS_COOKIE = 'access_token'
const REFRESH_COOKIE = 'refresh_token'

@Injectable()
export class AuthService {
    private readonly accessSecret: string
    private readonly refreshSecret: string
    private readonly accessTtlMinutes: number
    private readonly refreshTtlDays: number
    private readonly isProduction: boolean
    private readonly accessCookieBase: CookieOptions
    private readonly refreshCookieBase: CookieOptions

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.accessSecret =
            this.configService.get<string>('JWT_ACCESS_SECRET') ??
            this.configService.get<string>('JWT_SECRET') ??
            'supersecretkey'
        this.refreshSecret =
            this.configService.get<string>('JWT_REFRESH_SECRET') ??
            this.accessSecret
        this.accessTtlMinutes = Number(
            this.configService.get<string>('ACCESS_TTL_MIN') ?? 15,
        )
        this.refreshTtlDays = Number(
            this.configService.get<string>('REFRESH_TTL_DAYS') ?? 7,
        )
        this.isProduction =
            this.configService.get<string>('NODE_ENV') === 'production'
        this.accessCookieBase = { httpOnly: true, sameSite: 'lax', secure: this.isProduction, maxAge: this.accessTtlMinutes * 60 * 1000 }
        this.refreshCookieBase = { httpOnly: true, sameSite: 'lax', secure: this.isProduction, path: '/api/auth/refresh', maxAge: this.refreshTtlDays * 24 * 60 * 60 * 1000 }
    }

    private sanitizeUser(user: User): Omit<User, 'password'> {
        const { password, ...safeUser } = user
        return safeUser as Omit<User, 'password'>
    }

    private issueTokens(user: User) {
        const payload = { sub: user.id, email: user.email, role: user.role }

        const accessToken = this.jwtService.sign(payload, {
            secret: this.accessSecret,
            expiresIn: `${this.accessTtlMinutes}m`,
        })

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.refreshSecret,
            expiresIn: `${this.refreshTtlDays}d`,
        })

        return { accessToken, refreshToken }
    }

    async register(dto: RegisterDto) {
        const { email, password, name, profession } = dto
        const existing = await this.userRepo.findOne({ where: { email } })
        if (existing) throw new ConflictException('Email already in use')

        const hashed = await bcrypt.hash(password, 10)

        const user = this.userRepo.create({
            email,
            name,
            password: hashed,
            profession,
            role: UserRole.USER,
        })
        const savedUser = await this.userRepo.save(user)
        const tokens = this.issueTokens(savedUser)
        return { user: this.sanitizeUser(savedUser), tokens }
    }

    async login(dto: LoginDto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } })

        if (!user) throw new UnauthorizedException('Invalid credentials')

        const match = await bcrypt.compare(dto.password, user.password)
        if (!match) throw new UnauthorizedException('Invalid credentials')

        const tokens = this.issueTokens(user)
        return { user: this.sanitizeUser(user), tokens }
    }

    /**
     * Retrieves the current logged-in user by ID.
     * This is used by the /auth/me endpoint after decoding the JWT token.
     */
    async getMe(userId: string) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ['id', 'email', 'name', 'role', 'isActive'],
        })

        if (!user || !user.isActive) {
            return null
        }

        const { isActive, ...safeUser } = user
        return safeUser
    }

    applyAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
        res.cookie(ACCESS_COOKIE, tokens.accessToken, this.accessCookieBase)
        res.cookie(REFRESH_COOKIE, tokens.refreshToken, this.refreshCookieBase)
    }

    clearAuthCookies(res: Response) {
        res.cookie(ACCESS_COOKIE, '', { ...this.accessCookieBase, maxAge: 0 })
        res.cookie(REFRESH_COOKIE, '', { ...this.refreshCookieBase, maxAge: 0 })
    }

    async refreshTokens(refreshToken?: string) {
        if (!refreshToken) {
            throw new UnauthorizedException('Missing refresh token')
        }

        let payload: UserPayload
        try {
            payload = this.jwtService.verify<UserPayload>(refreshToken, {
                secret: this.refreshSecret,
            })
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token')
        }

        const user = await this.userRepo.findOne({
            where: { id: payload.sub },
        })

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid refresh token')
        }

        const tokens = this.issueTokens(user)

        return { user: this.sanitizeUser(user), tokens }
    }


    async createAdmin(userDto: RegisterDto, creator: UserPayload) {
        if (creator?.role !== UserRole.ADMIN) {
            throw new UnauthorizedException('Only admin can create another admin');
        }

        const existing = await this.userRepo.findOneBy({ email: userDto.email });
        if (existing) throw new BadRequestException('Email already exists');

        const hashed = await bcrypt.hash(userDto.password, 10);
        const user = this.userRepo.create({
            ...userDto,
            password: hashed,
            role: UserRole.ADMIN,
        });

        const saved = await this.userRepo.save(user);
        const { password, ...result } = saved;
        return result;
    }

}
