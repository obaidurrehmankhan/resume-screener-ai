import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req: any) {
        return req.user; // set by JwtStrategy → validate()
    }
}
