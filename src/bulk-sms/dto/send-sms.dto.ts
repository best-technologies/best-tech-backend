import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendSmsDto {
  @ApiProperty({ description: 'Sender ID', maxLength: 11 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(11)
  from: string;

  @ApiProperty({ description: 'Recipient numbers (single or comma-separated)' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ description: 'Message body/content' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ enum: ['direct-refund', '1', 'direct-corporate', '2', 'corporate', '6', 'international', '7', 'otp', '8'] })
  @IsOptional()
  @IsString()
  @IsIn(['direct-refund', '1', 'direct-corporate', '2', 'corporate', '6', 'international', '7', 'otp', '8'])
  gateway?: string;

  @ApiPropertyOptional({ enum: ['none', '1', 'hosted', '2', 'all', '3'] })
  @IsOptional()
  @IsString()
  @IsIn(['none', '1', 'hosted', '2', 'all', '3'])
  append_sender?: string;

  @ApiPropertyOptional({ description: 'Delivery report callback URL' })
  @IsOptional()
  @IsString()
  callback_url?: string;

  @ApiPropertyOptional({ description: 'Customer reference for mapping reports' })
  @IsOptional()
  @IsString()
  customer_reference?: string;
}


