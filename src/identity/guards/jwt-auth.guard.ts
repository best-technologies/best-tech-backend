import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private logger: LoggerService) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: any) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.warn(
        'JWT token not provided in Authorization header',
        'JWT-Auth',
      );
      throw new UnauthorizedException(
        'JWT token not provided in Authorization header',
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn(
        'Invalid Authorization header format. Expected: Bearer <token>',
        'JWT-Auth',
      );
      throw new UnauthorizedException(
        'Invalid Authorization header format. Expected: Bearer <token>',
      );
    }

    if (err || !user) {
      this.logger.warn('Invalid or expired JWT token', 'JWT-Auth');
      throw new UnauthorizedException('Invalid or expired JWT token');
    }

    return user;
  }
}

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
