import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserPayload } from '../auth/types/user-payload';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiOperation({ summary: 'Retrieve the authenticated user profile' })
    @ApiResponse({ status: 200, description: 'Returns the active user record.' })
    @ApiResponse({ status: 401, description: 'Missing or invalid authentication.' })
    getProfile(@CurrentUser() user: UserPayload) {
        return this.userService.findActiveById(user.sub);
    }
}
