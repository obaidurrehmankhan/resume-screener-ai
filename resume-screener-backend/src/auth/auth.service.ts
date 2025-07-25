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
import { User } from '../user/user.entity'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { UserRole } from '../common/enums/user-role.enum'

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService
    ) { }

    /**
     * Handles user registration:
     * - Hashes password
     * - Saves user to DB
     * - Returns JWT token with 1-hour expiration
     */
    async register(dto: RegisterDto): Promise<{ token: string }> {
        const { email, password, name, profession } = dto

        // Check if email already exists
        const existing = await this.userRepo.findOne({ where: { email } })
        if (existing) throw new ConflictException('Email already in use')

        // Hash password
        const hashed = await bcrypt.hash(password, 10)

        // Create and save new user
        const user = this.userRepo.create({
            email,
            name,
            password: hashed,
            profession,
        })
        await this.userRepo.save(user)

        // Sign token with expiration (1 hour)
        const token = this.jwtService.sign(
            { sub: user.id },
            { expiresIn: '1h' } // ⏰ Add exp field to token
        )

        return { token }
    }

    /**
     * Handles login:
     * - Verifies user credentials
     * - Returns JWT token with 1-hour expiration
     */
    async login(dto: LoginDto): Promise<{ token: string }> {
        const user = await this.userRepo.findOne({ where: { email: dto.email } })


        if (!user) throw new UnauthorizedException('Invalid credentials')

        // Compare input password with hashed password
        const match = await bcrypt.compare(dto.password, user.password)
        if (!match) throw new UnauthorizedException('Invalid credentials')

        // Sign token with expiration (1 hour)
        const token = this.jwtService.sign(
            { sub: user.id },
            { expiresIn: '1h' } // ⏰ Add exp field to token
        )

        return { token }
    }

    /**
     * Retrieves the current logged-in user by ID.
     * This is used by the /auth/me endpoint after decoding the JWT token.
     * 
     * @param userId - The ID of the authenticated user (extracted from the token's "sub" claim)
     * @returns The user object with only public fields (id, email, name)
     */
    async getMe(userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ['id', 'email', 'name'], // ✅ Only public fields
        })

        return user
    }


    async createAdmin(userDto: RegisterDto, creator: User) {
        if (creator.role !== UserRole.ADMIN) {
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
