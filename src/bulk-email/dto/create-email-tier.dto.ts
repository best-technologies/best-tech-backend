import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateEmailTierDto {
  @ApiProperty({ description: 'Tier name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Minimum number of emails (inclusive)' })
  @IsInt()
  @Min(1)
  minEmails: number;

  @ApiProperty({ description: 'Maximum number of emails (inclusive, null for no upper bound)', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxEmails?: number;

  @ApiProperty({ description: 'Price per email in NGN' })
  @IsNumber()
  @Min(0)
  pricePerEmail: number;

  @ApiProperty({ description: 'Email provider (optional: tie tier to a provider)' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({ description: 'Whether this tier is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
