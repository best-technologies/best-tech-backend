import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { QueryNewsletterDto } from './dto/query-newsletter.dto';
import { successResponse, failureResponse } from '../utils/response';
import { LoggerService } from '../common/logger/logger.service';
import * as colors from 'colors';
import { formatDate } from 'src/common/helper-functions/formatter';
import {
  sendNewsletterSubscriptionAdminNotification,
  sendNewsletterWelcomeEmail,
} from '../mailer/send-email';

@Injectable()
export class NewsletterService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async create(createNewsletterDto: CreateNewsletterDto) {
    this.logger.log(colors.green('Creating new newsletter subscription...'));

    try {
      const newsletter = await this.prisma.newsletter.create({
        data: createNewsletterDto,
      });

      this.logger.log(
        colors.green(
          `Newsletter subscription created successfully with ID: ${newsletter.id}`,
        ),
      );

      // Send welcome email to the subscriber
      try {
        this.logger.log(
          colors.blue(`Sending welcome email to ${newsletter.email}`),
        );

        await sendNewsletterWelcomeEmail(newsletter.email);

        this.logger.log(
          colors.green('Newsletter welcome email sent successfully'),
        );
      } catch (emailError) {
        this.logger.error(
          colors.red('Error sending newsletter welcome email:'),
          emailError,
        );
        // Don't fail the main operation if email fails
      }

      // Send notification to admins
      try {
        // Get all admin users
        const adminUsers = await this.prisma.user.findMany({
          where: {
            role: 'admin',
          },
          select: {
            email: true,
          },
        });

        if (adminUsers.length > 0) {
          const adminEmails = adminUsers.map((user) => user.email);

          this.logger.log(
            colors.blue(
              `Sending admin notification to ${adminEmails.length} admin(s)`,
            ),
          );

          // Get newsletter statistics
          const newsletterStats = await this.getNewsletterStats();

          await sendNewsletterSubscriptionAdminNotification(
            adminEmails,
            newsletter.email,
            newsletter.id,
            newsletterStats,
          );

          this.logger.log(
            colors.green('Admin notification email sent successfully'),
          );
        } else {
          this.logger.warn(
            colors.yellow('No admin users found to send notification'),
          );
        }
      } catch (emailError) {
        this.logger.error(
          colors.red('Error sending admin notification email:'),
          emailError,
        );
        // Don't fail the main operation if email fails
      }

      const formattedData = {
        id: newsletter.id,
        email: newsletter.email,
        createdAt: formatDate(newsletter.createdAt),
        updatedAt: formatDate(newsletter.updatedAt),
      };

      return successResponse(
        201,
        true,
        'Successfully subscribed to newsletter',
        1,
        formattedData,
      );
    } catch (error) {
      if (error.code === 'P2002') {
        this.logger.log(colors.red('Email already subscribed to newsletter'));
        return failureResponse(
          409,
          'Email already subscribed to newsletter',
          false,
        );
      }

      this.logger.error(
        colors.red('Error creating newsletter subscription:'),
        error,
      );
      return failureResponse(500, 'Failed to subscribe to newsletter', false);
    }
  }

  async findAll(queryDto: QueryNewsletterDto) {
    this.logger.log(
      colors.green('Fetching newsletter subscriptions with filters...'),
    );

    try {
      const {
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = queryDto;

      // Build where clause
      const whereClause: any = {};

      if (search) {
        whereClause.email = { contains: search, mode: 'insensitive' };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const take = limit;

      // Build order by clause
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Get total count for pagination
      const totalCount = await this.prisma.newsletter.count({
        where: whereClause,
      });

      // Get paginated results
      const newsletterSubscriptions = await this.prisma.newsletter.findMany({
        where: whereClause,
        orderBy,
        skip,
        take,
      });

      if (!newsletterSubscriptions || newsletterSubscriptions.length === 0) {
        this.logger.log(
          colors.yellow(
            'No newsletter subscriptions found with the specified filters',
          ),
        );
        return successResponse(
          200,
          true,
          'No newsletter subscriptions found with the specified filters',
          0,
          {
            subscriptions: [],
            pagination: {
              page,
              limit,
              totalCount,
              totalPages: Math.ceil(totalCount / limit),
              hasNext: page * limit < totalCount,
              hasPrev: page > 1,
            },
            stats: {
              totalSubscribers: totalCount,
            },
          },
        );
      }

      this.logger.log(
        colors.green(
          `Found ${newsletterSubscriptions.length} newsletter subscriptions`,
        ),
      );

      const formattedData = newsletterSubscriptions.map((subscription) => ({
        id: subscription.id,
        email: subscription.email,
        createdAt: formatDate(subscription.createdAt),
        updatedAt: formatDate(subscription.updatedAt),
      }));

      return successResponse(
        200,
        true,
        'Newsletter subscriptions fetched successfully',
        newsletterSubscriptions.length,
        {
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNext: page * limit < totalCount,
            hasPrev: page > 1,
          },
          stats: {
            totalSubscribers: totalCount,
          },
          subscriptions: formattedData,
        },
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error fetching newsletter subscriptions:'),
        error,
      );
      return failureResponse(
        500,
        'Failed to fetch newsletter subscriptions',
        false,
      );
    }
  }

  async findOne(id: string) {
    this.logger.log(
      colors.green(`Fetching newsletter subscription with ID: ${id}`),
    );

    try {
      const newsletter = await this.prisma.newsletter.findUnique({
        where: { id },
      });

      if (!newsletter) {
        this.logger.log(
          colors.red(`Newsletter subscription with ID ${id} not found`),
        );
        return failureResponse(404, 'Newsletter subscription not found', false);
      }

      this.logger.log(
        colors.green(
          `Newsletter subscription with ID ${id} found successfully`,
        ),
      );

      const formattedData = {
        id: newsletter.id,
        email: newsletter.email,
        createdAt: formatDate(newsletter.createdAt),
        updatedAt: formatDate(newsletter.updatedAt),
      };

      return successResponse(
        200,
        true,
        'Newsletter subscription fetched successfully',
        1,
        formattedData,
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error fetching newsletter subscription:'),
        error,
      );
      return failureResponse(
        500,
        'Failed to fetch newsletter subscription',
        false,
      );
    }
  }

  async update(id: string, updateNewsletterDto: UpdateNewsletterDto) {
    this.logger.log(
      colors.green(`Updating newsletter subscription with ID: ${id}`),
    );

    try {
      // Check if newsletter subscription exists
      const existingNewsletter = await this.prisma.newsletter.findUnique({
        where: { id },
      });

      if (!existingNewsletter) {
        this.logger.log(
          colors.red(`Newsletter subscription with ID ${id} not found`),
        );
        return failureResponse(404, 'Newsletter subscription not found', false);
      }

      // Filter out undefined values to only update passed fields
      const updateData = Object.fromEntries(
        Object.entries(updateNewsletterDto).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      this.logger.log(
        colors.green(`Updating fields: ${Object.keys(updateData).join(', ')}`),
      );

      const updatedNewsletter = await this.prisma.newsletter.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(
        colors.green(
          `Newsletter subscription with ID ${id} updated successfully`,
        ),
      );

      const formattedData = {
        id: updatedNewsletter.id,
        email: updatedNewsletter.email,
        createdAt: formatDate(updatedNewsletter.createdAt),
        updatedAt: formatDate(updatedNewsletter.updatedAt),
      };

      return successResponse(
        200,
        true,
        'Newsletter subscription updated successfully',
        1,
        formattedData,
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error updating newsletter subscription:'),
        error,
      );
      return failureResponse(
        500,
        'Failed to update newsletter subscription',
        false,
      );
    }
  }

  async remove(id: string) {
    this.logger.log(
      colors.green(`Deleting newsletter subscription with ID: ${id}`),
    );

    try {
      // Check if newsletter subscription exists
      const existingNewsletter = await this.prisma.newsletter.findUnique({
        where: { id },
      });

      if (!existingNewsletter) {
        this.logger.log(
          colors.red(`Newsletter subscription with ID ${id} not found`),
        );
        return failureResponse(404, 'Newsletter subscription not found', false);
      }

      await this.prisma.newsletter.delete({
        where: { id },
      });

      this.logger.log(
        colors.green(
          `Newsletter subscription with ID ${id} deleted successfully`,
        ),
      );

      return successResponse(
        200,
        true,
        'Newsletter subscription deleted successfully',
        1,
        { id },
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error deleting newsletter subscription:'),
        error,
      );
      return failureResponse(
        500,
        'Failed to delete newsletter subscription',
        false,
      );
    }
  }

  async unsubscribe(email: string) {
    this.logger.log(colors.green(`Unsubscribing email: ${email}`));

    try {
      const newsletter = await this.prisma.newsletter.findUnique({
        where: { email },
      });

      if (!newsletter) {
        this.logger.log(
          colors.red(`Email ${email} not found in newsletter subscription`),
        );
        return failureResponse(
          404,
          'Email not found in newsletter subscription',
          false,
        );
      }

      await this.prisma.newsletter.delete({
        where: { email },
      });

      this.logger.log(colors.green(`Email ${email} unsubscribed successfully`));

      return successResponse(
        200,
        true,
        'Successfully unsubscribed from newsletter',
        1,
        { email },
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error unsubscribing from newsletter:'),
        error,
      );
      return failureResponse(
        500,
        'Failed to unsubscribe from newsletter',
        false,
      );
    }
  }

  async getNewsletterStats() {
    try {
      // Get total subscribers
      const totalSubscribers = await this.prisma.newsletter.count();

      // Get this month's subscribers
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);

      const thisMonthSubscribers = await this.prisma.newsletter.count({
        where: {
          createdAt: {
            gte: thisMonthStart,
          },
        },
      });

      // Get this week's subscribers
      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
      thisWeekStart.setHours(0, 0, 0, 0);

      const thisWeekSubscribers = await this.prisma.newsletter.count({
        where: {
          createdAt: {
            gte: thisWeekStart,
          },
        },
      });

      // Calculate average subscribers per month (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const subscribersLast6Months = await this.prisma.newsletter.count({
        where: {
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
      });

      const averageSubscribersPerMonth = Math.round(subscribersLast6Months / 6);

      // Get top subscriber domains
      const allSubscribers = await this.prisma.newsletter.findMany({
        select: {
          email: true,
        },
      });

      const domainCounts: { [key: string]: number } = {};
      allSubscribers.forEach((subscriber) => {
        const domain = subscriber.email.split('@')[1];
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      });

      const topSubscriberDomains = Object.entries(domainCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([domain]) => domain);

      // For now, we'll set total newsletters sent to 0 since we don't have a newsletter sending system yet
      // This can be updated when you implement newsletter sending functionality
      const totalNewslettersSent = 0;

      return {
        totalSubscribers,
        totalNewslettersSent,
        thisMonthSubscribers,
        thisWeekSubscribers,
        averageSubscribersPerMonth,
        topSubscriberDomains,
      };
    } catch (error) {
      this.logger.error(colors.red('Error getting newsletter stats:'), error);
      // Return default stats if there's an error
      return {
        totalSubscribers: 0,
        totalNewslettersSent: 0,
        thisMonthSubscribers: 0,
        thisWeekSubscribers: 0,
        averageSubscribersPerMonth: 0,
        topSubscriberDomains: [],
      };
    }
  }
}
