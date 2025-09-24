import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmailTierDto } from './dto/create-email-tier.dto';
import { UpdateEmailTierDto } from './dto/update-email-tier.dto';
import { successResponse, failureResponse } from '../utils/response';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class EmailTierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getAllTiers() {
    try {
      const tiers = await this.prisma.emailCostTier.findMany({
        where: { isActive: true },
        orderBy: { minEmails: 'asc' },
      });

      return successResponse(
        200,
        true,
        'Email cost tiers retrieved successfully',
        undefined,
        tiers,
      );
    } catch (error: any) {
      this.logger.error('Error fetching email cost tiers', error?.stack || error, 'EmailTierService');
      return failureResponse(500, 'Error fetching email cost tiers');
    }
  }

  async createTier(dto: CreateEmailTierDto) {
    try {
      // Check for overlapping tiers
      const overlappingTier = await this.prisma.emailCostTier.findFirst({
        where: {
          isActive: true,
          provider: dto.provider || null,
          OR: [
            {
              minEmails: { lte: dto.minEmails },
              maxEmails: { gte: dto.minEmails },
            },
            {
              minEmails: { lte: dto.maxEmails || 999999 },
              maxEmails: { gte: dto.maxEmails || 999999 },
            },
            {
              minEmails: { gte: dto.minEmails },
              maxEmails: { lte: dto.maxEmails || 999999 },
            },
          ],
        },
      });

      if (overlappingTier) {
        return failureResponse(400, 'Tier range overlaps with existing active tier');
      }

      const tier = await this.prisma.emailCostTier.create({
        data: {
          name: dto.name,
          minEmails: dto.minEmails,
          maxEmails: dto.maxEmails,
          pricePerEmail: dto.pricePerEmail,
          provider: dto.provider,
          isActive: dto.isActive ?? true,
        },
      });

      return successResponse(
        201,
        true,
        'Email cost tier created successfully',
        undefined,
        tier,
      );
    } catch (error: any) {
      this.logger.error('Error creating email cost tier', error?.stack || error, 'EmailTierService');
      return failureResponse(500, 'Error creating email cost tier');
    }
  }

  async updateTier(id: string, dto: UpdateEmailTierDto) {
    try {
      const existingTier = await this.prisma.emailCostTier.findUnique({
        where: { id },
      });

      if (!existingTier) {
        return failureResponse(404, 'Email cost tier not found');
      }

      // Check for overlapping tiers (excluding current tier)
      if (dto.minEmails !== undefined || dto.maxEmails !== undefined) {
        const minEmails = dto.minEmails ?? existingTier.minEmails;
        const maxEmails = dto.maxEmails ?? existingTier.maxEmails;
        const provider = dto.provider ?? existingTier.provider;

        const overlappingTier = await this.prisma.emailCostTier.findFirst({
          where: {
            id: { not: id },
            isActive: true,
            provider: provider || null,
            OR: [
              {
                minEmails: { lte: minEmails },
                maxEmails: { gte: minEmails },
              },
              {
                minEmails: { lte: maxEmails || 999999 },
                maxEmails: { gte: maxEmails || 999999 },
              },
              {
                minEmails: { gte: minEmails },
                maxEmails: { lte: maxEmails || 999999 },
              },
            ],
          },
        });

        if (overlappingTier) {
          return failureResponse(400, 'Tier range overlaps with existing active tier');
        }
      }

      const updatedTier = await this.prisma.emailCostTier.update({
        where: { id },
        data: {
          ...dto,
          updatedAt: new Date(),
        },
      });

      return successResponse(
        200,
        true,
        'Email cost tier updated successfully',
        undefined,
        updatedTier,
      );
    } catch (error: any) {
      this.logger.error('Error updating email cost tier', error?.stack || error, 'EmailTierService');
      return failureResponse(500, 'Error updating email cost tier');
    }
  }

  async deactivateTier(id: string) {
    try {
      const existingTier = await this.prisma.emailCostTier.findUnique({
        where: { id },
      });

      if (!existingTier) {
        return failureResponse(404, 'Email cost tier not found');
      }

      const updatedTier = await this.prisma.emailCostTier.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      return successResponse(
        200,
        true,
        'Email cost tier deactivated successfully',
        undefined,
        updatedTier,
      );
    } catch (error: any) {
      this.logger.error('Error deactivating email cost tier', error?.stack || error, 'EmailTierService');
      return failureResponse(500, 'Error deactivating email cost tier');
    }
  }

  async getTierForEmailCount(emailCount: number, provider?: string) {
    try {
      const tier = await this.prisma.emailCostTier.findFirst({
        where: {
          isActive: true,
          minEmails: { lte: emailCount },
          OR: [
            { maxEmails: { gte: emailCount } },
            { maxEmails: null },
          ],
          provider: provider || null,
        },
        orderBy: { pricePerEmail: 'asc' },
      });

      return tier;
    } catch (error: any) {
      this.logger.error('Error finding email cost tier', error?.stack || error, 'EmailTierService');
      return null;
    }
  }
}
