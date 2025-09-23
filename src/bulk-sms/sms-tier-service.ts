import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSmsTierDto } from './dto/create-sms-tier.dto';
import { UpdateSmsTierDto } from './dto/update-sms-tier.dto';
import { LoggerService } from '../common/logger/logger.service';
import { successResponse, failureResponse } from '../utils/response';
import * as colors from 'colors';

@Injectable()
export class SmsTierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getAllTiers() {
    this.logger.log(colors.green('Fetching all SMS cost tiers...'));
    try {
      const tiers = await this.prisma.smsCostTier.findMany({
        orderBy: [{ minUnits: 'asc' }],
      });

      if (!tiers || tiers.length === 0) {
        this.logger.warn(colors.yellow('No SMS cost tiers found'));
        return successResponse(200, true, 'No SMS cost tiers found', 0, []);
      }

      this.logger.log(colors.green(`Found ${tiers.length} SMS cost tier(s)`));
      return successResponse(200, true, 'SMS cost tiers fetched successfully', tiers.length, tiers);
    } catch (error) {
      this.logger.error(colors.red('Error fetching SMS cost tiers:'), error);
      return failureResponse(500, 'Failed to fetch SMS cost tiers', false);
    }
  }

  async createTier(dto: CreateSmsTierDto) {
    this.logger.log(colors.green('Creating SMS cost tier...'));
    try {
      const tier = await this.prisma.smsCostTier.create({
        data: {
          name: dto.name,
          minUnits: dto.minUnits,
          maxUnits: dto.maxUnits ?? null,
          pricePerSms: dto.pricePerSms,
          gateway: dto.gateway,
          isActive: dto.isActive ?? true,
        },
      });

      this.logger.log(colors.green(`SMS cost tier created successfully with ID: ${tier.id}`));
      return successResponse(201, true, 'SMS cost tier created successfully', 1, tier);
    } catch (error: any) {
      // Prisma unique constraint code (P2002)
      if (error?.code === 'P2002') {
        this.logger.warn(colors.yellow('Tier overlaps an existing range for this gateway'));
        return failureResponse(409, 'A tier for this range/gateway already exists', false);
      }
      this.logger.error(colors.red('Error creating SMS cost tier:'), error);
      return failureResponse(500, 'Failed to create SMS cost tier', false);
    }
  }

  async updateTier(id: string, dto: UpdateSmsTierDto) {
    this.logger.log(colors.green(`Updating SMS cost tier with ID: ${id}`));
    try {
      const exists = await this.prisma.smsCostTier.findUnique({ where: { id } });
      if (!exists) {
        this.logger.warn(colors.yellow('SMS cost tier not found'));
        return failureResponse(404, 'SMS cost tier not found', false);
      }

      const tier = await this.prisma.smsCostTier.update({
        where: { id },
        data: {
          name: dto.name ?? undefined,
          minUnits: dto.minUnits ?? undefined,
          maxUnits: dto.maxUnits === undefined ? undefined : dto.maxUnits,
          pricePerSms: dto.pricePerSms ?? undefined,
          gateway: dto.gateway ?? undefined,
          isActive: dto.isActive ?? undefined,
        },
      });

      this.logger.log(colors.green(`SMS cost tier with ID ${id} updated successfully`));
      return successResponse(200, true, 'SMS cost tier updated successfully', 1, tier);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        this.logger.warn(colors.yellow('Updated tier conflicts with an existing range/gateway'));
        return failureResponse(409, 'Updated range/gateway conflicts with existing tier', false);
      }
      this.logger.error(colors.red('Error updating SMS cost tier:'), error);
      return failureResponse(500, 'Failed to update SMS cost tier', false);
    }
  }

  async deactivateTier(id: string) {
    this.logger.log(colors.green(`Deactivating SMS cost tier with ID: ${id}`));
    try {
      const exists = await this.prisma.smsCostTier.findUnique({ where: { id } });
      if (!exists) {
        this.logger.warn(colors.yellow('SMS cost tier not found'));
        return failureResponse(404, 'SMS cost tier not found', false);
      }

      const tier = await this.prisma.smsCostTier.update({
        where: { id },
        data: { isActive: false },
      });

      this.logger.log(colors.green(`SMS cost tier with ID ${id} deactivated`));
      return successResponse(200, true, 'SMS cost tier deactivated', 1, tier);
    } catch (error) {
      this.logger.error(colors.red('Error deactivating SMS cost tier:'), error);
      return failureResponse(500, 'Failed to deactivate SMS cost tier', false);
    }
  }
}


