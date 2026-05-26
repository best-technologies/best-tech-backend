import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { successResponse, failureResponse } from '../utils/response';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async getUserDashboard(userId: string) {
    this.logger.log('Getting user dashboard...', 'UsersService');

    try {
      if (!userId) {
        this.logger.error('User ID is required');
        return failureResponse(400, 'User ID is required');
      }

      this.logger.log('User ID: ' + userId, 'UsersService');

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
          staffProfile: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          studentProfile: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
      });

      if (!user) {
        this.logger.error('User not found');
        return failureResponse(404, 'User not found');
      }

      const serviceStats = await this.prisma.service.aggregate({
        where: { userId: userId },
        _count: {
          id: true,
        },
      });

      let contactStats: { totalSubmissions: number } | null = null;
      if (user.role === 'admin' || user.role === 'staff') {
        const contactAggregate = await this.prisma.contactUs.aggregate({
          _count: {
            id: true,
          },
        });
        contactStats = {
          totalSubmissions: contactAggregate._count.id || 0,
        };
      }

      const dashboard = {
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          memberSince: user.createdAt,
          isStaff: !!user.staffProfile,
          isStudent: !!user.studentProfile,
        },
        statistics: {
          services: {
            totalCreated: serviceStats._count.id || 0,
          },
          contacts: contactStats,
        },
      };

      this.logger.log('User dashboard retrieved successfully');

      return successResponse(
        200,
        true,
        'User dashboard retrieved successfully',
        undefined,
        dashboard,
      );
    } catch (error: any) {
      return failureResponse(500, 'Error retrieving user dashboard');
    }
  }
}
