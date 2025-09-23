import { Module } from '@nestjs/common';
import { BulkSmsService } from './bulk-sms.service';
import { BulkSmsController } from './bulk-sms.controller';
import { SmsTierService } from './sms-tier-service';

@Module({
  providers: [BulkSmsService, SmsTierService],
  exports: [BulkSmsService, SmsTierService],
  controllers: [BulkSmsController]
})
export class BulkSmsModule {}


