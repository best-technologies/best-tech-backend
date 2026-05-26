import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NewsletterStatus } from '../../prisma/client';

export class NewsletterImageDto {
  @ApiProperty({
    description: 'Image public ID from Cloudinary',
    example: 'newsletter/abc123',
  })
  @IsString()
  @IsNotEmpty()
  publicId: string;

  @ApiProperty({
    description: 'Image secure URL from Cloudinary',
    example:
      'https://res.cloudinary.com/cloud/image/upload/v123/newsletter/abc123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  secureUrl: string;

  @ApiPropertyOptional({
    description: 'Alt text for the image',
    example: 'Monthly newsletter banner',
  })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({
    description: 'Image caption',
    example: 'Exciting updates this month!',
  })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({
    description: 'Display order of the image',
    example: 1,
    default: 0,
  })
  @IsOptional()
  order?: number = 0;
}

export class CreateNewsletterTemplateDto {
  @ApiProperty({
    description: 'Newsletter subject line',
    example: 'Monthly Tech Updates - January 2025',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Newsletter title',
    example: 'Best Technologies Monthly Newsletter',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Newsletter subtitle',
    example: 'Stay updated with the latest in technology',
  })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({
    description: 'Newsletter body content (HTML supported)',
    example:
      '<h1>Welcome to our newsletter!</h1><p>This is the main content...</p>',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    description: 'Newsletter images array',
    type: [NewsletterImageDto],
    example: [
      {
        publicId: 'newsletter/abc123',
        secureUrl:
          'https://res.cloudinary.com/cloud/image/upload/v123/newsletter/abc123.jpg',
        alt: 'Newsletter banner',
        caption: 'Monthly updates',
        order: 1,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @Type(() => NewsletterImageDto)
  images?: NewsletterImageDto[];

  @ApiPropertyOptional({
    description:
      'Newsletter status. Defaults to "draft". Use "draft" to create template, then use /send endpoint to send to subscribers.',
    enum: NewsletterStatus,
    default: 'draft',
    example: 'draft',
  })
  @IsOptional()
  @IsEnum(NewsletterStatus)
  status?: NewsletterStatus = 'draft';
}
