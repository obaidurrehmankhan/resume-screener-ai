import {
    Controller,
    Get,
    Post,
    Body,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
    UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserPayload } from './types/user-payload';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
    /**
   * Get currently logged-in user
   * Protected route → requires JWT
   */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@Req() req: Request) {
        const userId = (req.user as UserPayload | undefined)?.sub;
        if (!userId) {
            throw new UnauthorizedException('Invalid token');
        }
        return this.authService.getMe(userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('create-admin')
    createAdmin(@Body() dto: RegisterDto, @Req() req: Request) {
        return this.authService.createAdmin(dto, req.user as UserPayload);
    }

}
