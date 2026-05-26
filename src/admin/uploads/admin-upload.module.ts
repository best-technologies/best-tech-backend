import { Module } from '@nestjs/common';
import { AdminUploadController } from './admin-upload.controller';
import { IdentityModule } from '../../identity/identity.module';

@Module({
  imports: [IdentityModule],
  controllers: [AdminUploadController],
})
export class AdminUploadModule {}
