import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { ApiResponse } from '../utils/response';
import type { AuthenticatedRequest } from '../identity/types/authenticated-request.interface';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import type { UserProfileData } from './types/user-profile.types';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get authenticated user dashboard data' })
  getUserDashboard(
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<unknown>> {
    return this.usersService.getUserDashboard(req.user);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  getProfile(
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<UserProfileData>> {
    return this.usersService.getUserProfile(req.user);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<ApiResponse<UserProfileData>> {
    return this.usersService.updateUserProfile(req.user, dto);
  }
}
