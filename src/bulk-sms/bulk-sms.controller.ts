import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BulkSmsService } from './bulk-sms.service';
import { SendSmsDto } from './dto/send-sms.dto';

@ApiTags('Bulk SMS')
@Controller('bulk-sms')
export class BulkSmsController {
  constructor(private readonly bulkSmsService: BulkSmsService) {}

  @Get('balance')
  async getBalance() {
    return this.bulkSmsService.getWalletBalance();
  }

  @Post('send-sms')
  async sendSms(@Body() dto: SendSmsDto) {
    return this.bulkSmsService.sendSms(dto);
  }
}


