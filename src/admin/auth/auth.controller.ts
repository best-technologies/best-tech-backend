import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminSignInDto, VerifyOtpDto } from '../dto/admin-auth.dto';
import { AdminAuthService } from './auth.service';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: AdminSignInDto, @Res() res: Response) {
    const result = await this.adminAuthService.signIn(dto);
    return res.status(result.statusCode).json(result);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res() res: Response) {
    const result = await this.adminAuthService.verifyOtp(dto);
    return res.status(result.statusCode).json(result);
  }
}
