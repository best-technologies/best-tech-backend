import { Module } from '@nestjs/common';
import { BulkEmailService } from './bulk-email.service';
import { BulkEmailController } from './bulk-email.controller';
import { EmailTierService } from './email-tier.service';

@Module({
  providers: [BulkEmailService, EmailTierService],
  exports: [BulkEmailService, EmailTierService],
  controllers: [BulkEmailController]
})
export class BulkEmailModule {}
