import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findActiveById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id, isActive: true } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...rest } = user;
    return rest;
  }
}
