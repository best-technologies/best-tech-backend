import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';
import * as colors from 'colors';

@Injectable()
export class CloudinaryService {
  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: { buffer: Buffer; mimetype: string },
    folder: string = 'best-technologies/newsletter',
  ): Promise<{ publicId: string; secureUrl: string }> {
    try {
      this.logger.log(
        colors.blue(`Uploading image to Cloudinary folder: ${folder}`),
      );

      // Convert buffer to base64
      const base64Image = file.buffer.toString('base64');
      const dataURI = `data:${file.mimetype};base64,${base64Image}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      this.logger.log(
        colors.green(`Image uploaded successfully: ${result.public_id}`),
      );

      return {
        publicId: result.public_id,
        secureUrl: result.secure_url,
      };
    } catch (error) {
      this.logger.error(
        colors.red('Error uploading image to Cloudinary:'),
        error,
      );
      console.error('Full Cloudinary error:', error);
      throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      this.logger.log(
        colors.blue(`Deleting image from Cloudinary: ${publicId}`),
      );

      await cloudinary.uploader.destroy(publicId);

      this.logger.log(colors.green(`Image deleted successfully: ${publicId}`));
    } catch (error) {
      this.logger.error(
        colors.red('Error deleting image from Cloudinary:'),
        error,
      );
      throw new Error('Failed to delete image from Cloudinary');
    }
  }

  async updateImage(
    publicId: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<{ publicId: string; secureUrl: string }> {
    try {
      this.logger.log(colors.blue(`Updating image in Cloudinary: ${publicId}`));

      // Delete old image
      await this.deleteImage(publicId);

      // Upload new image
      return await this.uploadImage(file);
    } catch (error) {
      this.logger.error(
        colors.red('Error updating image in Cloudinary:'),
        error,
      );
      throw new Error('Failed to update image in Cloudinary');
    }
  }
}
