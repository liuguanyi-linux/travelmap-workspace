import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('admin-login')
  adminLogin(@Body() body: { username: string; password: string }) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'travelmap2024';

    if (body.username === adminUsername && body.password === adminPassword) {
      return { success: true };
    }
    throw new UnauthorizedException('用户名或密码错误');
  }
}
