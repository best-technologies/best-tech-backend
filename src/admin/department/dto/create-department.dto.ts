import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const trimOptionalString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : null;

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Department name',
    example: 'Engineering',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  name: string;

  @ApiPropertyOptional({
    description: 'Department description',
    example: 'Software development and infrastructure',
  })
  @IsOptional()
  @IsString()
  @Transform(trimOptionalString)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the department is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
