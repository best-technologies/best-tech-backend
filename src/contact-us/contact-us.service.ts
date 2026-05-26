import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { QueryContactUsDto } from './dto/query-contact-us.dto';
import { successResponse, failureResponse } from '../utils/response';
import { LoggerService } from '../common/logger/logger.service';
import * as colors from 'colors';
import { formatDate } from 'src/common/helper-functions/formatter';
import {
  sendContactUsNotification,
  sendContactUsUserConfirmation,
} from '../mailer/send-email';

@Injectable()
export class ContactUsService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async create(createContactUsDto: CreateContactUsDto) {
    this.logger.log(colors.green('Creating new contact us entry...'));

    try {
      const contactUs = await this.prisma.contactUs.create({
        data: {
          ...createContactUsDto,
          status: 'initiated', // Automatically set status to initiated
        },
      });

      this.logger.log(
        colors.green(
          `Contact us entry created successfully with ID: ${contactUs.id}`,
        ),
      );

      // Send email notification to admins
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
              `Sending notification to ${adminEmails.length} admin(s)`,
            ),
          );

          await sendContactUsNotification(
            adminEmails,
            createContactUsDto,
            contactUs.id,
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

      // Send confirmation email to the submitting user (non-blocking failure)
      try {
        this.logger.log(
          colors.blue(
            `Sending confirmation to user: ${createContactUsDto.email}`,
          ),
        );
        await sendContactUsUserConfirmation(
          createContactUsDto.email,
          createContactUsDto,
          contactUs.id,
        );
        this.logger.log(
          colors.green('User confirmation email sent successfully'),
        );
      } catch (userEmailError) {
        this.logger.error(
          colors.red('Error sending user confirmation email:'),
          userEmailError,
        );
        // Do not fail the operation on email failure
      }

      const formattedData = {
        id: contactUs.id,
        fullName: contactUs.fullName,
        email: contactUs.email,
        companyName: contactUs.companyName,
        phoneNumber: contactUs.phoneNumber,
        subject: contactUs.subject,
        projectType: contactUs.projectType,
        proposedBudget: contactUs.proposedBudget,
        projectTimeline: contactUs.projectTimeline,
        projectDetails: contactUs.projectDetails,
        status: contactUs.status,
        createdAt: formatDate(contactUs.createdAt),
        updatedAt: formatDate(contactUs.updatedAt),
      };

      return successResponse(
        201,
        true,
        'Contact us entry created successfully',
        1,
        formattedData,
      );
    } catch (error) {
      this.logger.error(colors.red('Error creating contact us entry:'), error);
      return failureResponse(500, 'Failed to create contact us entry', false);
    }
  }

  async findAll(queryDto: QueryContactUsDto) {
    this.logger.log(
      colors.green('Fetching contact us entries with filters...'),
    );

    try {
      const {
        status,
        subject,
        proposedBudget,
        projectTimeline,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = queryDto;

      // Build where clause
      const whereClause: any = {};

      if (status) {
        whereClause.status = status;
      }

      if (subject) {
        whereClause.subject = subject;
      }

      if (proposedBudget) {
        whereClause.proposedBudget = proposedBudget;
      }

      if (projectTimeline) {
        whereClause.projectTimeline = projectTimeline;
      }

      if (search) {
        whereClause.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { projectDetails: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const take = limit;

      // Build order by clause
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Get total count for pagination
      const totalCount = await this.prisma.contactUs.count({
        where: whereClause,
      });

      // Get paginated results
      const contactUsEntries = await this.prisma.contactUs.findMany({
        where: whereClause,
        orderBy,
        skip,
        take,
      });

      // Get status counts for dashboard cards
      const allCount = await this.prisma.contactUs.count();
      const statusCounts = await this.prisma.contactUs.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      // Create a map of status counts
      const statusMap = new Map();
      statusCounts.forEach((stat) => {
        statusMap.set(stat.status, stat._count.status);
      });

      // Define all possible statuses
      const allStatuses = [
        'initiated',
        'awaiting_payment',
        'awaiting_document_agreement',
        'mvp_in_progress',
        'mvp_completed',
        'project_in_progress',
        'project_completed',
        'on_hold',
        'cancelled',
        'rejected',
      ];

      // Create stats cards data
      const statsCards = allStatuses.map((status) => ({
        status,
        count: statusMap.get(status) || 0,
        label: status
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
      }));

      // Add "All" card
      const allCard = {
        status: 'all',
        count: allCount,
        label: 'All',
      };

      if (!contactUsEntries || contactUsEntries.length === 0) {
        this.logger.log(
          colors.yellow(
            'No contact us entries found with the specified filters',
          ),
        );
        return successResponse(
          200,
          true,
          'No contact us entries found with the specified filters',
          0,
          {
            entries: [],
            pagination: {
              page,
              limit,
              totalCount,
              totalPages: Math.ceil(totalCount / limit),
              hasNext: page * limit < totalCount,
              hasPrev: page > 1,
            },
            statsCards: {
              allCard,
              statusCards: statsCards,
              totalCount: allCount,
            },
          },
        );
      }

      this.logger.log(
        colors.green(`Found ${contactUsEntries.length} contact us entries`),
      );

      const formattedData = contactUsEntries.map((entry) => ({
        id: entry.id,
        fullName: entry.fullName,
        email: entry.email,
        companyName: entry.companyName,
        phoneNumber: entry.phoneNumber,
        subject: entry.subject,
        projectType: entry.projectType,
        proposedBudget: entry.proposedBudget,
        projectTimeline: entry.projectTimeline,
        projectDetails: entry.projectDetails,
        status: entry.status,
        createdAt: formatDate(entry.createdAt),
        updatedAt: formatDate(entry.updatedAt),
      }));

      return successResponse(
        200,
        true,
        'Contact us entries fetched successfully',
        contactUsEntries.length,
        {
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNext: page * limit < totalCount,
            hasPrev: page > 1,
          },
          statsCards: {
            allCard,
            statusCards: statsCards,
            totalCount: allCount,
          },
          entries: formattedData,
        },
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error fetching contact us entries:'),
        error,
      );
      return failureResponse(500, 'Failed to fetch contact us entries', false);
    }
  }

  async findOne(id: string) {
    this.logger.log(colors.green(`Fetching contact us entry with ID: ${id}`));

    try {
      const contactUs = await this.prisma.contactUs.findUnique({
        where: { id },
      });

      if (!contactUs) {
        this.logger.log(colors.red(`Contact us entry with ID ${id} not found`));
        return failureResponse(404, 'Contact us entry not found', false);
      }

      this.logger.log(
        colors.green(`Contact us entry with ID ${id} found successfully`),
      );

      const formattedData = {
        id: contactUs.id,
        fullName: contactUs.fullName,
        email: contactUs.email,
        companyName: contactUs.companyName,
        phoneNumber: contactUs.phoneNumber,
        subject: contactUs.subject,
        projectType: contactUs.projectType,
        proposedBudget: contactUs.proposedBudget,
        projectTimeline: contactUs.projectTimeline,
        projectDetails: contactUs.projectDetails,
        status: contactUs.status,
        createdAt: contactUs.createdAt,
        updatedAt: contactUs.updatedAt,
      };

      return successResponse(
        200,
        true,
        'Contact us entry fetched successfully',
        1,
        formattedData,
      );
    } catch (error) {
      this.logger.error(colors.red('Error fetching contact us entry:'), error);
      return failureResponse(500, 'Failed to fetch contact us entry', false);
    }
  }

  async update(id: string, updateContactUsDto: UpdateContactUsDto) {
    this.logger.log(colors.green(`Updating contact us entry with ID: ${id}`));

    try {
      // Check if contact us entry exists
      const existingContactUs = await this.prisma.contactUs.findUnique({
        where: { id },
      });

      if (!existingContactUs) {
        this.logger.log(colors.red(`Contact us entry with ID ${id} not found`));
        return failureResponse(404, 'Contact us entry not found', false);
      }

      // Filter out undefined values to only update passed fields
      const updateData = Object.fromEntries(
        Object.entries(updateContactUsDto).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      this.logger.log(
        colors.green(`Updating fields: ${Object.keys(updateData).join(', ')}`),
      );

      const updatedContactUs = await this.prisma.contactUs.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(
        colors.green(`Contact us entry with ID ${id} updated successfully`),
      );

      const formattedData = {
        id: updatedContactUs.id,
        fullName: updatedContactUs.fullName,
        email: updatedContactUs.email,
        companyName: updatedContactUs.companyName,
        phoneNumber: updatedContactUs.phoneNumber,
        subject: updatedContactUs.subject,
        projectType: updatedContactUs.projectType,
        proposedBudget: updatedContactUs.proposedBudget,
        projectTimeline: updatedContactUs.projectTimeline,
        projectDetails: updatedContactUs.projectDetails,
        status: updatedContactUs.status,
        createdAt: formatDate(updatedContactUs.createdAt),
        updatedAt: formatDate(updatedContactUs.updatedAt),
      };

      return successResponse(
        200,
        true,
        'Contact us entry updated successfully',
        1,
        formattedData,
      );
    } catch (error) {
      this.logger.error(colors.red('Error updating contact us entry:'), error);
      return failureResponse(500, 'Failed to update contact us entry', false);
    }
  }

  async remove(id: string) {
    this.logger.log(colors.green(`Deleting contact us entry with ID: ${id}`));

    try {
      // Check if contact us entry exists
      const existingContactUs = await this.prisma.contactUs.findUnique({
        where: { id },
      });

      if (!existingContactUs) {
        this.logger.log(colors.red(`Contact us entry with ID ${id} not found`));
        return failureResponse(404, 'Contact us entry not found', false);
      }

      await this.prisma.contactUs.delete({
        where: { id },
      });

      this.logger.log(
        colors.green(`Contact us entry with ID ${id} deleted successfully`),
      );

      return successResponse(
        200,
        true,
        'Contact us entry deleted successfully',
        1,
        { id },
      );
    } catch (error) {
      this.logger.error(colors.red('Error deleting contact us entry:'), error);
      return failureResponse(500, 'Failed to delete contact us entry', false);
    }
  }

  // Additional utility methods
  async getContactUsStats() {
    this.logger.log(colors.green('Fetching contact us statistics...'));

    try {
      const totalEntries = await this.prisma.contactUs.count();

      // Get counts by status
      const statusStats = await this.prisma.contactUs.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      // Get counts by subject
      const subjectStats = await this.prisma.contactUs.groupBy({
        by: ['subject'],
        _count: {
          subject: true,
        },
      });

      // Get counts by budget range
      const budgetStats = await this.prisma.contactUs.groupBy({
        by: ['proposedBudget'],
        _count: {
          proposedBudget: true,
        },
      });

      // Get recent entries (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentEntries = await this.prisma.contactUs.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      const formattedStats = {
        totalEntries,
        statusStats: statusStats.map((stat) => ({
          status: stat.status,
          count: stat._count.status,
        })),
        subjectStats: subjectStats.map((stat) => ({
          subject: stat.subject,
          count: stat._count.subject,
        })),
        budgetStats: budgetStats.map((stat) => ({
          budget: stat.proposedBudget,
          count: stat._count.proposedBudget,
        })),
        recentEntries,
      };

      this.logger.log(
        colors.green('Contact us statistics fetched successfully'),
      );

      return successResponse(
        200,
        true,
        'Contact us statistics fetched successfully',
        1,
        formattedStats,
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error fetching contact us statistics:'),
        error,
      );
      return failureResponse(
        500,
        'Failed to fetch contact us statistics',
        false,
      );
    }
  }

  async searchContactUs(query: string) {
    this.logger.log(
      colors.green(`Searching contact us entries with query: ${query}`),
    );

    try {
      const searchResults = await this.prisma.contactUs.findMany({
        where: {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { companyName: { contains: query, mode: 'insensitive' } },
            { projectDetails: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!searchResults || searchResults.length === 0) {
        this.logger.log(
          colors.yellow(
            'No contact us entries found matching the search query',
          ),
        );
        return successResponse(
          200,
          true,
          'No contact us entries found matching the search query',
          0,
          [],
        );
      }

      this.logger.log(
        colors.green(
          `Found ${searchResults.length} contact us entries matching the search query`,
        ),
      );

      const formattedData = searchResults.map((entry) => ({
        id: entry.id,
        fullName: entry.fullName,
        email: entry.email,
        companyName: entry.companyName,
        phoneNumber: entry.phoneNumber,
        subject: entry.subject,
        proposedBudget: entry.proposedBudget,
        projectTimeline: entry.projectTimeline,
        projectDetails: entry.projectDetails,
        status: entry.status,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      }));

      return successResponse(
        200,
        true,
        'Contact us search completed successfully',
        searchResults.length,
        formattedData,
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error searching contact us entries:'),
        error,
      );
      return failureResponse(500, 'Failed to search contact us entries', false);
    }
  }
}
