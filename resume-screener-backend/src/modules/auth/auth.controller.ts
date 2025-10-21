import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserPayload } from './types/user-payload';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
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
    async getMe(@CurrentUser() user: UserPayload) {
        const profile = await this.authService.getMe(user.sub);
        if (!profile) {
            throw new NotFoundException('User not found');
        }
        return profile;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('create-admin')
    createAdmin(@Body() dto: RegisterDto, @CurrentUser() user: UserPayload) {
        return this.authService.createAdmin(dto, user);
    }

}
