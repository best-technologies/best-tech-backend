import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateSmsTierDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Inclusive minimum units in this tier' })
  @IsInt()
  @Min(1)
  minUnits: number;

  @ApiPropertyOptional({ description: 'Inclusive maximum units; null for no upper bound' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUnits?: number | null;

  @ApiProperty({ description: 'Price per SMS in NGN' })
  @IsNumber()
  @IsPositive()
  pricePerSms: number;

  @ApiPropertyOptional({ description: 'Optional gateway name to scope this tier' })
  @IsOptional()
  @IsString()
  gateway?: string;

  @ApiPropertyOptional({ description: 'Whether this tier is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


