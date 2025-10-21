import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApiTags } from '@nestjs/swagger';
import { UserPayload } from './types/user-payload';
import { CurrentUser } from './decorators/current-user.decorator';
import { Request, Response } from 'express';
import { EntitlementsService } from '../../common/security/entitlements.service';
import { RequiresEntitlements } from '../../common/security/entitlement.decorator';
import { Entitlement } from '../../common/types/entitlements';
import { EntitlementGuard } from '../../common/security/entitlement.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly entitlementsService: EntitlementsService,
    ) { }

    @Post('register')
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.register(dto);
        this.authService.applyAuthCookies(res, result.tokens);
        return result.user;
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.login(dto);
        this.authService.applyAuthCookies(res, result.tokens);
        return result.user;
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@CurrentUser() user: UserPayload) {
        const profile = await this.authService.getMe(user.sub);
        if (!profile) {
            throw new NotFoundException('User not found');
        }
        const { plan, entitlements } = this.entitlementsService.getEntitlements({ user: profile });
        return {
            ...profile,
            plan,
            entitlements: Array.from(entitlements),
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refresh_token;
        const result = await this.authService.refreshTokens(refreshToken);
        this.authService.applyAuthCookies(res, result.tokens);
        return result.user;
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(@Res({ passthrough: true }) res: Response) {
        this.authService.clearAuthCookies(res);
    }

    @UseGuards(JwtAuthGuard, RolesGuard, EntitlementGuard)
    @RequiresEntitlements(Entitlement.ADMIN_MANAGE_USERS)
    @Roles(UserRole.ADMIN)
    @Post('create-admin')
    createAdmin(@Body() dto: RegisterDto, @CurrentUser() user: UserPayload) {
        return this.authService.createAdmin(dto, user);
    }

}
