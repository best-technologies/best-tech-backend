import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { successResponse, failureResponse } from '../utils/response';
import { LoggerService } from '../common/logger/logger.service';
import { BulkSmsService } from '../bulk-sms/bulk-sms.service';
import { ConfigService } from '@nestjs/config';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private configService: ConfigService,
    private bulkSmsService: BulkSmsService,
  ) {}

  async getUserDashboard(userId: string) {

    this.logger.log('Getting user dashboard...', 'UsersService');

    try {
      if (!userId) {
        this.logger.error('User ID is required');
        return failureResponse(400, 'User ID is required');
      }

      this.logger.log('User ID: ' + userId, 'UsersService');

      // Get user basic info
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
            }
          },
          studentProfile: {
            select: {
              id: true,
              createdAt: true,
            }
          }
        }
      });

      if (!user) {
        this.logger.error('User not found');
        return failureResponse(404, 'User not found');
      }

      // Filter criteria: admins see all, regular users see only their own
      const userFilter = user.role === 'admin' ? {} : { userId: userId };

      // Get SMS statistics
      const smsStats = await this.prisma.sms.aggregate({
        where: userFilter,
        _count: {
          id: true
        },
        _sum: {
          cost: true
        }
      });

      // Get email statistics
      const emailStats = await this.prisma.email.aggregate({
        where: userFilter,
        _count: {
          id: true
        },
        _sum: {
          cost: true
        }
      });

      // Get recent SMS activity
      const recentSms = await this.prisma.sms.findMany({
        where: userFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          to: true,
          body: true,
          status: true,
          cost: true,
          createdAt: true
        }
      });

      // Get recent email activity
      const recentEmails = await this.prisma.email.findMany({
        where: userFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          to: true,
          subject: true,
          status: true,
          cost: true,
          createdAt: true
        }
      });

      // Get wallet balances
      const smsWallet = await this.prisma.smsWallet.findFirst({
        where: { userId: userId },
        select: {
          totalBalance: true,
          universalWallet: true,
          smsWallet: true,
          balanceBefore: true,
          smsBonus: true,
          mainBalance: true,
          volumeBonus: true,
          promoBonus: true,
          currentBalance: true,
          lastAmountSpent: true
        }
      });

      const emailWallet = await this.prisma.emailWallet.findFirst({
        where: { userId: userId },
        select: {
          totalBalance: true,
          emailWallet: true,
          emailBonus: true,
          mainBalance: true,
          volumeBonus: true,
          promoBonus: true,
          currentBalance: true,
          lastAmountSpent: true
        }
      });

      // Get service statistics
      const serviceStats = await this.prisma.service.aggregate({
        where: { userId: userId },
        _count: {
          id: true
        }
      });

      // Get admin-specific data
      let adminSmsWallet = null;
      if (user.role === 'admin') {
        this.logger.log('Fetching admin SMS wallet balance', 'UsersService');
        try {
          const bulksmsWallet = await this.bulkSmsService.getWalletBalance();
          this.logger.log('Admin SMS wallet balance fetched', bulksmsWallet);
          if (bulksmsWallet.success) {
            adminSmsWallet = bulksmsWallet.data;
          }
        } catch (error) {
          this.logger.error('Failed to fetch admin SMS wallet balance', error, 'UsersService');
        }
      }

      // Get contact us submissions (if user is admin/staff)
      let contactStats: { totalSubmissions: number } | null = null;
      if (user.role === 'admin' || user.role === 'staff') {
        const contactAggregate = await this.prisma.contactUs.aggregate({
          _count: {
            id: true
          }
        });
        contactStats = {
          totalSubmissions: contactAggregate._count.id || 0
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
          isStudent: !!user.studentProfile
        },
        statistics: {
          sms: {
            totalSent: smsStats._count.id || 0,
            totalCost: smsStats._sum.cost || 0,
            walletBalance: smsWallet?.totalBalance || 0,
            lastSpent: smsWallet?.balanceBefore || 0,
            adminWallet: adminSmsWallet
          },
          email: {
            totalSent: emailStats._count.id || 0,
            totalCost: emailStats._sum.cost || 0,
            walletBalance: emailWallet?.currentBalance || 0,
            lastSpent: emailWallet?.lastAmountSpent || 0
          },
          services: {
            totalCreated: serviceStats._count.id || 0
          },
          contacts: contactStats
        },
        recentActivity: {
          sms: recentSms,
          emails: recentEmails
        },
        adminData: user.role === 'admin' ? {
          smsWallet: adminSmsWallet
        } : null
      };

      this.logger.log('User dashboard retrieved successfully');

      return successResponse(
        200,
        true,
        'User dashboard retrieved successfully',
        undefined,
        dashboard
      );
    } catch (error: any) {
      return failureResponse(500, 'Error retrieving user dashboard');
    }
  }
}