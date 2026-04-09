import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body('email') email: string, @Req() req: any) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '';
    const userAgent = req.headers['user-agent'] || '';
    return this.usersService.login(email, ip, userAgent);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('login-logs')
  async getLoginLogs() {
    return this.usersService.getLoginLogs(200);
  }

  @Get(':email')
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }
}
