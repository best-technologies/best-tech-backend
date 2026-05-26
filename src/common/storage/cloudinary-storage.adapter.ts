import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../services/cloudinary.service';
import type { MulterImageFile, StoredImage } from './storage.interface';

@Injectable()
export class CloudinaryStorageAdapter {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async uploadImage(
    file: MulterImageFile,
    folder: string,
  ): Promise<StoredImage> {
    const normalized =
      folder === 'newsletter'
        ? 'best-technologies/newsletter'
        : `best-technologies/${folder.replace(/^\/+|\/+$/g, '')}`;
    const result = await this.cloudinary.uploadImage(file, normalized);
    return { key: result.publicId, url: result.secureUrl };
  }

  async deleteImage(key: string): Promise<void> {
    if (!key) return;
    await this.cloudinary.deleteImage(key);
  }
}
