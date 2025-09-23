import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BulkSmsService } from './bulk-sms.service';
import { SendSmsDto } from './dto/send-sms.dto';
import { SmsTierService } from './sms-tier-service';
import { CreateSmsTierDto } from './dto/create-sms-tier.dto';
import { UpdateSmsTierDto } from './dto/update-sms-tier.dto';

@ApiTags('Bulk SMS')
@Controller('bulk-sms')
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
  async sendSms(@Body() dto: SendSmsDto) {
    return this.bulkSmsService.sendSms(dto);
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


