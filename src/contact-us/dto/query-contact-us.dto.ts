import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ContactSubject,
  ProposedBudget,
  ProjectTimeline,
  ContactStatus,
} from '../../prisma/client';

export class QueryContactUsDto {
  @ApiProperty({
    description: 'Filter by status',
    enum: ContactStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiProperty({
    description: 'Filter by subject',
    enum: ContactSubject,
    required: false,
  })
  @IsOptional()
  @IsEnum(ContactSubject)
  subject?: ContactSubject;

  @ApiProperty({
    description: 'Filter by proposed budget',
    enum: ProposedBudget,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProposedBudget)
  proposedBudget?: ProposedBudget;

  @ApiProperty({
    description: 'Filter by project timeline',
    enum: ProjectTimeline,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectTimeline)
  projectTimeline?: ProjectTimeline;

  @ApiProperty({
    description: 'Search in name, email, company, or project details',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Page number (starts from 1)',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort by field',
    example: 'createdAt',
    required: false,
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
