import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
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
        const userId = req.user?.sub;
        return this.authService.getMe(userId)
    }

}
