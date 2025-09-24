import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EmailAttachmentDto {
  @ApiProperty({ description: 'File name' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ description: 'File content as base64 string' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'MIME type of the file' })
  @IsOptional()
  @IsString()
  contentType?: string;

  @ApiPropertyOptional({ description: 'Content disposition (attachment or inline)' })
  @IsOptional()
  @IsString()
  disposition?: 'attachment' | 'inline';
}

export class SendEmailDto {
  @ApiProperty({ description: 'Sender email address' })
  @IsEmail()
  @IsNotEmpty()
  from: string;

  @ApiProperty({ description: 'Sender name (optional)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fromName?: string;

  @ApiProperty({ 
    description: 'Recipient email addresses (single or comma-separated)',
    example: 'user1@example.com,user2@example.com'
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiPropertyOptional({ 
    description: 'CC recipients (comma-separated)',
    example: 'cc1@example.com,cc2@example.com'
  })
  @IsOptional()
  @IsString()
  cc?: string;

  @ApiPropertyOptional({ 
    description: 'BCC recipients (comma-separated)',
    example: 'bcc1@example.com,bcc2@example.com'
  })
  @IsOptional()
  @IsString()
  bcc?: string;

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @ApiProperty({ description: 'Email body (HTML or plain text)' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ 
    description: 'Content type of the body',
    enum: ['text/plain', 'text/html'],
    default: 'text/html'
  })
  @IsOptional()
  @IsString()
  contentType?: 'text/plain' | 'text/html';

  @ApiPropertyOptional({ 
    description: 'Email attachments',
    type: [EmailAttachmentDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachmentDto)
  attachments?: EmailAttachmentDto[];

  @ApiPropertyOptional({ description: 'Reply-to email address' })
  @IsOptional()
  @IsEmail()
  replyTo?: string;

  @ApiPropertyOptional({ description: 'Customer reference for tracking' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerReference?: string;

  @ApiPropertyOptional({ description: 'Priority of the email', enum: ['low', 'normal', 'high'] })
  @IsOptional()
  @IsString()
  priority?: 'low' | 'normal' | 'high';

  @ApiPropertyOptional({ description: 'Callback URL for delivery status updates' })
  @IsOptional()
  @IsUrl()
  callbackUrl?: string;
}
