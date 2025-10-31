import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Hello world root endpoint' })
  @ApiResponse({ status: 200, description: 'Returns a greeting string.' })
  getHello(): string {
    return this.appService.getHello();
  }
}
