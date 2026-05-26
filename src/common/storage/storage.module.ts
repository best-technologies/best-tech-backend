import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from '../services/cloudinary.service';
import { LoggerModule } from '../logger/logger.module';
import { CloudinaryStorageAdapter } from './cloudinary-storage.adapter';
import { S3StorageService } from './s3-storage.service';
import { StorageService } from './storage.service';

@Global()
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [
    CloudinaryService,
    CloudinaryStorageAdapter,
    S3StorageService,
    StorageService,
  ],
  exports: [StorageService, CloudinaryService, S3StorageService],
})
export class StorageModule {}
