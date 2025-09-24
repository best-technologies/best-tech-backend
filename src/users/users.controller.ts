import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get authenticated user dashboard data' })
  async getUserDashboard(@Request() req: any) {
    if (!req.user || !req.user.userId) {
      throw new Error('User not authenticated or user ID not found');
    }
    return this.usersService.getUserDashboard(req.user.userId);
  }
}
