import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessExpiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    LoggerModule,
  ],
  controllers: [IdentityController],
  providers: [IdentityService, JwtStrategy, JwtRefreshStrategy, JwtAuthGuard],
  exports: [IdentityService, JwtAuthGuard],
})
export class IdentityModule {}
