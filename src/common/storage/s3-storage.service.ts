import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutPublicAccessBlockCommand,
  PutBucketPolicyCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  type BucketLocationConstraint,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { LoggerService } from '../logger/logger.service';
import type { MulterImageFile, StoredImage } from './storage.interface';
import * as colors from 'colors';

@Injectable()
export class S3StorageService implements OnModuleInit {
  private client!: S3Client;
  private region!: string;
  private bucket!: string;
  private enabled = false;
  private initialized = false;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    const provider = (
      this.config.get<string>('storage.provider') ?? 'cloudinary'
    ).toLowerCase();
    if (provider !== 'aws-s3') return;

    this.region =
      this.config.get<string>('storage.aws.region') || 'af-south-1';
    this.bucket = this.config.get<string>('storage.aws.bucket') || '';
    const accessKeyId = this.config.get<string>('storage.aws.accessKeyId');
    const secretAccessKey = this.config.get<string>(
      'storage.aws.secretAccessKey',
    );

    if (!this.bucket || !accessKeyId || !secretAccessKey) {
      this.logger.warn(
        colors.yellow(
          'S3 selected but AWS_S3_BUCKET or credentials missing; S3 uploads will fail until configured.',
        ),
        'S3StorageService',
      );
      return;
    }

    this.client = new S3Client({
      region: this.region,
      credentials: { accessKeyId, secretAccessKey },
    });
    this.enabled = true;
  }

  private async ensureInitialized() {
    if (!this.enabled) return;
    if (this.initialized) return;
    const autoCreate =
      this.config.get<boolean>('storage.aws.autoCreateBucket') ?? false;
    if (autoCreate) {
      await this.ensureBucketExistsAndPublic();
    }
    this.initialized = true;
  }

  private async ensureBucketExistsAndPublic() {
    try {
      await this.client.send(
        new HeadBucketCommand({ Bucket: this.bucket }),
      );
      this.logger.log(colors.green(`S3 bucket exists: ${this.bucket}`));
    } catch (_err: unknown) {
      this.logger.log(
        colors.blue(`Creating S3 bucket: ${this.bucket} in ${this.region}`),
      );

      try {
        if (this.region === 'us-east-1') {
          await this.client.send(
            new CreateBucketCommand({
              Bucket: this.bucket,
            }),
          );
        } else {
          await this.client.send(
            new CreateBucketCommand({
              Bucket: this.bucket,
              CreateBucketConfiguration: {
                LocationConstraint: this.region as BucketLocationConstraint,
              },
            }),
          );
        }
      } catch (createErr: unknown) {
        const name =
          createErr instanceof Error ? createErr.name : String(createErr);
        if (name === 'BucketAlreadyOwnedByYou') {
          this.logger.log(colors.green('S3 bucket already owned by this account'));
        } else {
          throw createErr;
        }
      }
    }

    await this.client.send(
      new PutPublicAccessBlockCommand({
        Bucket: this.bucket,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          IgnorePublicAcls: false,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      }),
    );

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        },
      ],
    };

    await this.client.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify(policy),
      }),
    );

    await this.client.send(
      new PutBucketCorsCommand({
        Bucket: this.bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD', 'DELETE'],
              AllowedOrigins: ['*'],
              ExposeHeaders: ['ETag'],
            },
          ],
        },
      }),
    );

    this.logger.log(
      colors.green(`S3 bucket public read + CORS configured: ${this.bucket}`),
    );
  }

  private buildObjectUrl(key: string): string {
    const encodedKey = key
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    if (this.region === 'us-east-1') {
      return `https://${this.bucket}.s3.amazonaws.com/${encodedKey}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${encodedKey}`;
  }

  private extensionFromMimetype(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    return map[mimetype.toLowerCase()] ?? 'bin';
  }

  async uploadImage(
    file: MulterImageFile,
    folder: string,
    filenameSuffix?: string,
  ): Promise<StoredImage> {
    if (!this.enabled) {
      throw new Error('S3 storage is not configured');
    }
    await this.ensureInitialized();

    const suffix = filenameSuffix ?? randomUUID();
    const ext = this.extensionFromMimetype(file.mimetype);
    const key = `${folder.replace(/\/+$/, '')}/${suffix}.${ext}`;

    /**
     * Buckets with Object Ownership "Bucket owner enforced" reject object ACLs.
     * Public URLs still work via bucket policy (see ensureBucketExistsAndPublic).
     */
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return { key, url: this.buildObjectUrl(key) };
  }

  async deleteImage(key: string): Promise<void> {
    if (!this.enabled || !key) return;
    await this.ensureInitialized();
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
