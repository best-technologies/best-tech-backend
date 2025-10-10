import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BulkSmsService } from './bulk-sms.service';
import { SendSmsDto } from './dto/send-sms.dto';
import { SmsTierService } from './sms-tier-service';
import { CreateSmsTierDto } from './dto/create-sms-tier.dto';
import { UpdateSmsTierDto } from './dto/update-sms-tier.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';

@ApiTags('Bulk SMS')
@Controller('bulk-sms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BulkSmsController {
  constructor(
    private readonly bulkSmsService: BulkSmsService,
    private readonly smsTierService: SmsTierService,
  ) {}

  @Get('balance')
  async getBalance() {
    return this.bulkSmsService.getWalletBalance();
  }

  @Post('send-sms')
  async sendSms(@Body() dto: SendSmsDto, @Request() req: any) {
    return this.bulkSmsService.sendSms(dto, req.user.userId);
  }

  // Tiers
  @Get('tiers')
  async getAllTiers() {
    return this.smsTierService.getAllTiers();
  }

  @Post('tiers')
  async createTier(@Body() dto: CreateSmsTierDto) {
    return this.smsTierService.createTier(dto);
  }

  @Patch('tiers/:id')
  async updateTier(@Param('id') id: string, @Body() dto: UpdateSmsTierDto) {
    return this.smsTierService.updateTier(id, dto);
  }

  @Delete('tiers/:id')
  async deactivateTier(@Param('id') id: string) {
    return this.smsTierService.deactivateTier(id);
  }
}


