import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto): Promise<{ token: string }> {
        const { email, password, name, profession } = dto;

        const existing = await this.userRepo.findOne({ where: { email } });
        if (existing) throw new ConflictException('Email already in use');

        const hashed = await bcrypt.hash(password, 10);

        const user = this.userRepo.create({ email, name, password: hashed, profession });
        await this.userRepo.save(user);

        const token = this.jwtService.sign({ sub: user.id });

        return { token };
    }

    async login(dto: LoginDto): Promise<{ token: string }> {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });

        if (!user) throw new UnauthorizedException('Invalid credentials');

        const match = await bcrypt.compare(dto.password, user.password);
        if (!match) throw new UnauthorizedException('Invalid credentials');

        const token = this.jwtService.sign({ sub: user.id });

        return { token };
    }
}
