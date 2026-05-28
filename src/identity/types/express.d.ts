import type { JwtAuthUser } from './jwt-auth-user.interface';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtAuthUser;
  }
}

export {};
