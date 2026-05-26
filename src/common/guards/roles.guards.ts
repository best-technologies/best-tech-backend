// roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true; // No role restriction on this route

    const { user } = context.switchToHttp().getRequest();
    console.log('user role: ', user?.role);

    // Case-insensitive role comparison
    const userRole = user?.role?.toLowerCase();
    const hasRequiredRole = requiredRoles.some(
      (requiredRole) => requiredRole.toLowerCase() === userRole,
    );

    return hasRequiredRole; // Only allow if user has required role
  }
}
