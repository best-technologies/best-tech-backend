import type { Request } from 'express';
import type { JwtAuthUser } from './jwt-auth-user.interface';

export interface AuthenticatedRequest extends Request {
  user?: JwtAuthUser;
}
