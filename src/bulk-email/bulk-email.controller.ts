import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BulkEmailService } from './bulk-email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailTierService } from './email-tier.service';
import { CreateEmailTierDto } from './dto/create-email-tier.dto';
import { UpdateEmailTierDto } from './dto/update-email-tier.dto';

@ApiTags('Bulk Email')
@Controller('bulk-email')
export class BulkEmailController {
  constructor(
    private readonly bulkEmailService: BulkEmailService,
    private readonly emailTierService: EmailTierService,
  ) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get email wallet balance' })
  async getBalance() {
    return this.bulkEmailService.getWalletBalance();
  }

  @Post('send-email')
  @ApiOperation({ summary: 'Send bulk email' })
  async sendEmail(@Body() dto: SendEmailDto) {
    return this.bulkEmailService.sendEmail(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get email sending history' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status (pending, sent, failed, bounced, delivered, opened, clicked)' })
  async getEmailHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.bulkEmailService.getEmailHistory(page, limit, status);
  }

  @Get('email/:id')
  @ApiOperation({ summary: 'Get email details by ID' })
  async getEmailById(@Param('id') id: string) {
    return this.bulkEmailService.getEmailById(id);
  }

  // Email Tier Management
  @Get('tiers')
  @ApiOperation({ summary: 'Get all email cost tiers' })
  async getAllTiers() {
    return this.emailTierService.getAllTiers();
  }

  @Post('tiers')
  @ApiOperation({ summary: 'Create new email cost tier' })
  async createTier(@Body() dto: CreateEmailTierDto) {
    return this.emailTierService.createTier(dto);
  }

  @Post('tiers/:id')
  @ApiOperation({ summary: 'Update email cost tier' })
  async updateTier(@Param('id') id: string, @Body() dto: UpdateEmailTierDto) {
    return this.emailTierService.updateTier(id, dto);
  }

  @Post('tiers/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate email cost tier' })
  async deactivateTier(@Param('id') id: string) {
    return this.emailTierService.deactivateTier(id);
  }
}
