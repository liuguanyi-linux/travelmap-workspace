import { Controller, Post, Body, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminGuard } from '../auth/admin.guard';

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
  @UseGuards(AdminGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('login-logs')
  @UseGuards(AdminGuard)
  async getLoginLogs() {
    return this.usersService.getLoginLogs(200);
  }

  @Get(':email')
  @UseGuards(AdminGuard)
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }
}
