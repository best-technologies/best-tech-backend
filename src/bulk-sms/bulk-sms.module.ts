import { Module } from '@nestjs/common';
import { BulkSmsService } from './bulk-sms.service';
import { BulkSmsController } from './bulk-sms.controller';

@Module({
  providers: [BulkSmsService],
  exports: [BulkSmsService],
  controllers: [BulkSmsController]
})
export class BulkSmsModule {}


