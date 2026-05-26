import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryStorageAdapter } from './cloudinary-storage.adapter';
import { S3StorageService } from './s3-storage.service';
import type { MulterImageFile, StoredImage } from './storage.interface';

@Injectable()
export class StorageService {
  constructor(
    private readonly config: ConfigService,
    private readonly s3Storage: S3StorageService,
    private readonly cloudinaryStorage: CloudinaryStorageAdapter,
  ) {}

  private isS3(): boolean {
    const p = (
      this.config.get<string>('storage.provider') ?? 'cloudinary'
    ).toLowerCase();
    return p === 'aws-s3' || p === 's3';
  }

  async uploadImage(
    file: MulterImageFile,
    folder: string,
    filenameSuffix?: string,
  ): Promise<StoredImage> {
    if (this.isS3()) {
      return this.s3Storage.uploadImage(file, folder, filenameSuffix);
    }
    return this.cloudinaryStorage.uploadImage(file, folder);
  }

  async deleteImage(key: string): Promise<void> {
    if (!key) return;
    if (this.isS3()) {
      await this.s3Storage.deleteImage(key);
    } else {
      await this.cloudinaryStorage.deleteImage(key);
    }
  }
}
