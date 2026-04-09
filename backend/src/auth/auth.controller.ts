import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('admin-login')
  adminLogin(@Body() body: { username: string; password: string }) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'travelmap2024';

    if (body.username === adminUsername && body.password === adminPassword) {
      const token = this.jwtService.sign({ role: 'admin' });
      return { success: true, token };
    }
    throw new UnauthorizedException('用户名或密码错误');
  }
}
