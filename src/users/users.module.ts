import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BulkSmsModule } from '../bulk-sms/bulk-sms.module';

@Module({
  imports: [BulkSmsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
