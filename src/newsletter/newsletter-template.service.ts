import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { CreateNewsletterTemplateDto } from './dto/create-newsletter-template.dto';
import { UpdateNewsletterTemplateDto } from './dto/update-newsletter-template.dto';
import { QueryNewsletterTemplateDto } from './dto/query-newsletter-template.dto';
import { successResponse, failureResponse } from '../utils/response';
import { LoggerService } from '../common/logger/logger.service';
import { sendNewsletterToSubscribers } from '../mailer/send-email';
import * as colors from 'colors';
import { formatDate } from 'src/common/helper-functions/formatter';

// Type for file uploads
type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

@Injectable()
export class NewsletterTemplateService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private logger: LoggerService,
  ) {}

  async create(
    createNewsletterTemplateDto: CreateNewsletterTemplateDto,
    userId: string,
    imageFiles?: MulterFile[],
  ) {
    this.logger.log(colors.green('Creating new newsletter template...'));

    if (!userId) {
      this.logger.error(
        colors.red('User ID is required to create newsletter template'),
      );
      return failureResponse(
        400,
        'User ID is required to create newsletter template',
        false,
      );
    }

    try {
      let images: any[] = [];

      // Upload images to Cloudinary if provided
      if (imageFiles && imageFiles.length > 0) {
        this.logger.log(
          colors.blue(
            `Uploading ${imageFiles.length} image(s) to Cloudinary...`,
          ),
        );

        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i];
          const uploadResult = await this.cloudinaryService.uploadImage(
            imageFile,
            'newsletter',
          );

          images.push({
            publicId: uploadResult.publicId,
            secureUrl: uploadResult.secureUrl,
            alt: `Newsletter image ${i + 1}`,
            order: i,
          });
        }

        this.logger.log(
          colors.green(`${images.length} image(s) uploaded successfully`),
        );
      }

      // If images are provided in DTO, merge with uploaded images
      if (createNewsletterTemplateDto.images) {
        images = [...images, ...createNewsletterTemplateDto.images];
      }

      const newsletterTemplate = await this.prisma.newsletterTemplate.create({
        data: {
          ...createNewsletterTemplateDto,
          images: images.length > 0 ? images : undefined,
          createdById: userId,
        },
      });

      // Fetch the created template with relations
      const createdTemplate = await this.prisma.newsletterTemplate.findUnique({
        where: { id: newsletterTemplate.id },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!createdTemplate) {
        throw new Error('Failed to fetch created template');
      }

      this.logger.log(
        colors.green(
          `Newsletter template created successfully with ID: ${newsletterTemplate.id}`,
        ),
      );

      const formattedData = {
        id: createdTemplate.id,
        subject: createdTemplate.subject,
        title: createdTemplate.title,
        subtitle: createdTemplate.subtitle,
        body: createdTemplate.body,
        images: createdTemplate.images,
        status: createdTemplate.status,
        sentCount: createdTemplate.sentCount,
        createdAt: formatDate(createdTemplate.createdAt),
        updatedAt: formatDate(createdTemplate.updatedAt),
        createdBy: {
          firstName: createdTemplate.createdBy.firstName,
          lastName: createdTemplate.createdBy.lastName,
          email: createdTemplate.createdBy.email,
        },
      };

      return successResponse(
        201,
        true,
        'Newsletter template created successfully',
        1,
        formattedData,
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error creating newsletter template:'),
        error,
      );
      return failureResponse(
        500,
        'Failed to create newsletter template',
        false,
      );
    }
  }

  async findAll(queryDto: QueryNewsletterTemplateDto) {
    this.logger.log(
      colors.green('Fetching newsletter templates with filters...'),
    );

    try {
      const {
        search,
        status,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = queryDto;

      // Build where clause
      const whereClause: any = {};

      if (search) {
        whereClause.OR = [
          { subject: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { subtitle: { contains: search, mode: 'insensitive' } },
          { body: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) {
        whereClause.status = status;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const take = limit;

      // Build order by clause
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Get total count for pagination
      const totalCount = await this.prisma.newsletterTemplate.count({
        where: whereClause,
      });

      // Get paginated results
      const newsletterTemplates = await this.prisma.newsletterTemplate.findMany(
        {
          where: whereClause,
          orderBy,
          skip,
          take,
          include: {
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      );

      if (!newsletterTemplates || newsletterTemplates.length === 0) {
        this.logger.log(
          colors.yellow(
            'No newsletter templates found with the specified filters',
          ),
        );
        return successResponse(
          200,
          true,
          'No newsletter templates found with the specified filters',
          0,
          {
            templates: [],
            pagination: {
              page,
              limit,
              totalCount,
              totalPages: Math.ceil(totalCount / limit),
              hasNext: page * limit < totalCount,
              hasPrev: page > 1,
            },
            stats: {
              totalTemplates: totalCount,
              draftCount: await this.prisma.newsletterTemplate.count({
                where: { status: 'draft' },
              }),
              sentCount: await this.prisma.newsletterTemplate.count({
                where: { status: 'sent' },
              }),
            },
          },
        );
      }

      this.logger.log(
        colors.green(
          `Found ${newsletterTemplates.length} newsletter templates`,
        ),
      );

      const formattedData = newsletterTemplates.map((template) => ({
        id: template.id,
        subject: template.subject,
        title: template.title,
        subtitle: template.subtitle,
        body: template.body,
        images: template.images,
        status: template.status,
        sentCount: template.sentCount,
        sentAt: template.sentAt ? formatDate(template.sentAt) : null,
        createdAt: formatDate(template.createdAt),
        updatedAt: formatDate(template.updatedAt),
        createdBy: {
          firstName: template.createdBy.firstName,
          lastName: template.createdBy.lastName,
          email: template.createdBy.email,
        },
      }));

      return successResponse(
        200,
        true,
        'Newsletter templates fetched successfully',
        newsletterTemplates.length,
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
            totalTemplates: totalCount,
            draftCount: await this.prisma.newsletterTemplate.count({
              where: { status: 'draft' },
            }),
            sentCount: await this.prisma.newsletterTemplate.count({
              where: { status: 'sent' },
            }),
          },
          templates: formattedData,
        },
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error fetching newsletter templates:'),
        error,
      );
      return failureResponse(
        500,
        'Failed to fetch newsletter templates',
        false,
      );
    }
  }

  async findOne(id: string) {
    this.logger.log(
      colors.green(`Fetching newsletter template with ID: ${id}`),
    );

    try {
      const newsletterTemplate =
        await this.prisma.newsletterTemplate.findUnique({
          where: { id },
          include: {
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

      if (!newsletterTemplate) {
        this.logger.log(
          colors.red(`Newsletter template with ID ${id} not found`),
        );
        return failureResponse(404, 'Newsletter template not found', false);
      }

      this.logger.log(
        colors.green(`Newsletter template with ID ${id} found successfully`),
      );

      const formattedData = {
        id: newsletterTemplate.id,
        subject: newsletterTemplate.subject,
        title: newsletterTemplate.title,
        subtitle: newsletterTemplate.subtitle,
        body: newsletterTemplate.body,
        images: newsletterTemplate.images,
        status: newsletterTemplate.status,
        sentCount: newsletterTemplate.sentCount,
        sentAt: newsletterTemplate.sentAt
          ? formatDate(newsletterTemplate.sentAt)
          : null,
        createdAt: formatDate(newsletterTemplate.createdAt),
        updatedAt: formatDate(newsletterTemplate.updatedAt),
        createdBy: {
          firstName: newsletterTemplate.createdBy.firstName,
          lastName: newsletterTemplate.createdBy.lastName,
          email: newsletterTemplate.createdBy.email,
        },
      };

      return successResponse(
        200,
        true,
        'Newsletter template fetched successfully',
        1,
        formattedData,
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error fetching newsletter template:'),
        error,
      );
      return failureResponse(500, 'Failed to fetch newsletter template', false);
    }
  }

  async update(
    id: string,
    updateNewsletterTemplateDto: UpdateNewsletterTemplateDto,
    imageFile?: MulterFile,
  ) {
    this.logger.log(
      colors.green(`Updating newsletter template with ID: ${id}`),
    );

    try {
      // Check if newsletter template exists
      const existingTemplate = await this.prisma.newsletterTemplate.findUnique({
        where: { id },
      });

      if (!existingTemplate) {
        this.logger.log(
          colors.red(`Newsletter template with ID ${id} not found`),
        );
        return failureResponse(404, 'Newsletter template not found', false);
      }

      const images = (existingTemplate.images as any[]) || [];

      // Handle image update
      if (imageFile) {
        this.logger.log(colors.blue('Uploading new image to Cloudinary...'));

        const uploadResult = await this.cloudinaryService.uploadImage(
          imageFile,
          'newsletter',
        );

        images.push({
          publicId: uploadResult.publicId,
          secureUrl: uploadResult.secureUrl,
          alt: `Newsletter image ${images.length + 1}`,
          order: images.length,
        });

        this.logger.log(colors.green('Image uploaded successfully'));
      }

      // Filter out undefined values
      const updateData = Object.fromEntries(
        Object.entries(updateNewsletterTemplateDto).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      // Add images data if updated
      if (imageFile) {
        updateData.images = images;
      }

      this.logger.log(
        colors.green(`Updating fields: ${Object.keys(updateData).join(', ')}`),
      );

      const updatedTemplate = await this.prisma.newsletterTemplate.update({
        where: { id },
        data: updateData,
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(
        colors.green(`Newsletter template with ID ${id} updated successfully`),
      );

      const formattedData = {
        id: updatedTemplate.id,
        subject: updatedTemplate.subject,
        title: updatedTemplate.title,
        subtitle: updatedTemplate.subtitle,
        body: updatedTemplate.body,
        images: updatedTemplate.images,
        status: updatedTemplate.status,
        sentCount: updatedTemplate.sentCount,
        sentAt: updatedTemplate.sentAt
          ? formatDate(updatedTemplate.sentAt)
          : null,
        createdAt: formatDate(updatedTemplate.createdAt),
        updatedAt: formatDate(updatedTemplate.updatedAt),
        createdBy: {
          firstName: updatedTemplate.createdBy.firstName,
          lastName: updatedTemplate.createdBy.lastName,
          email: updatedTemplate.createdBy.email,
        },
      };

      return successResponse(
        200,
        true,
        'Newsletter template updated successfully',
        1,
        formattedData,
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error updating newsletter template:'),
        error,
      );
      return failureResponse(
        500,
        'Failed to update newsletter template',
        false,
      );
    }
  }

  async remove(id: string) {
    this.logger.log(
      colors.green(`Deleting newsletter template with ID: ${id}`),
    );

    try {
      // Check if newsletter template exists
      const existingTemplate = await this.prisma.newsletterTemplate.findUnique({
        where: { id },
      });

      if (!existingTemplate) {
        this.logger.log(
          colors.red(`Newsletter template with ID ${id} not found`),
        );
        return failureResponse(404, 'Newsletter template not found', false);
      }

      // Delete images from Cloudinary if exists
      if (existingTemplate.images) {
        const images = existingTemplate.images as any[];
        for (const image of images) {
          try {
            await this.cloudinaryService.deleteImage(image.publicId);
            this.logger.log(
              colors.green(`Image ${image.publicId} deleted from Cloudinary`),
            );
          } catch (error) {
            this.logger.error(
              colors.red(
                `Error deleting image ${image.publicId} from Cloudinary:`,
              ),
              error,
            );
          }
        }
      }

      await this.prisma.newsletterTemplate.delete({
        where: { id },
      });

      this.logger.log(
        colors.green(`Newsletter template with ID ${id} deleted successfully`),
      );

      return successResponse(
        200,
        true,
        'Newsletter template deleted successfully',
        1,
        { id },
      );
    } catch (error) {
      this.logger.error(
        colors.red('Error deleting newsletter template:'),
        error,
      );
      return failureResponse(
        500,
        'Failed to delete newsletter template',
        false,
      );
    }
  }

  async sendNewsletter(id: string) {
    this.logger.log(colors.green(`Sending newsletter template with ID: ${id}`));

    try {
      // Get the newsletter template
      const newsletterTemplate =
        await this.prisma.newsletterTemplate.findUnique({
          where: { id },
        });

      if (!newsletterTemplate) {
        this.logger.log(
          colors.red(`Newsletter template with ID ${id} not found`),
        );
        return failureResponse(404, 'Newsletter template not found', false);
      }

      if (newsletterTemplate.status === 'sent') {
        this.logger.log(colors.yellow('Newsletter has already been sent'));
        return failureResponse(400, 'Newsletter has already been sent', false);
      }

      // Get all newsletter subscribers
      const subscribers = await this.prisma.newsletter.findMany({
        select: { email: true },
      });

      if (subscribers.length === 0) {
        this.logger.log(colors.yellow('No subscribers found'));
        return failureResponse(
          400,
          'No subscribers found to send newsletter to',
          false,
        );
      }

      const subscriberEmails = subscribers.map((sub) => sub.email);

      this.logger.log(
        colors.blue(
          `Sending newsletter to ${subscriberEmails.length} subscribers`,
        ),
      );

      // Send newsletter to all subscribers
      const sendResult = await sendNewsletterToSubscribers(
        newsletterTemplate.subject,
        newsletterTemplate.title,
        newsletterTemplate.subtitle,
        newsletterTemplate.body,
        newsletterTemplate.images as any[] | null,
        subscriberEmails,
      );

      // Update newsletter template status
      await this.prisma.newsletterTemplate.update({
        where: { id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          sentCount: sendResult.sent,
        },
      });

      this.logger.log(
        colors.green(
          `Newsletter sent successfully. Sent: ${sendResult.sent}, Failed: ${sendResult.failed}`,
        ),
      );

      return successResponse(200, true, 'Newsletter sent successfully', 1, {
        templateId: id,
        sent: sendResult.sent,
        failed: sendResult.failed,
        totalSubscribers: subscriberEmails.length,
      });
    } catch (error) {
      this.logger.error(colors.red('Error sending newsletter:'), error);
      return failureResponse(500, 'Failed to send newsletter', false);
    }
  }
}
