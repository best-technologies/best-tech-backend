import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ContactSubject,
  ProposedBudget,
  ProjectTimeline,
  ContactStatus,
} from '../../prisma/client';

export class UpdateContactUsDto {
  @ApiProperty({
    description: 'Full name of the person contacting',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  fullName?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email?: string;

  @ApiProperty({
    description: 'Company name (optional)',
    example: 'Tech Corp',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase() || null)
  companyName?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+2348012345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  phoneNumber?: string;

  @ApiProperty({
    description: 'Subject of the inquiry',
    enum: ContactSubject,
    example: ContactSubject.general_enquiry,
    required: false,
  })
  @IsOptional()
  @IsEnum(ContactSubject)
  @Transform(({ value }) => value?.toLowerCase())
  subject?: ContactSubject;

  @ApiProperty({
    description: 'Proposed budget for the project',
    enum: ProposedBudget,
    example: ProposedBudget.one_million,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProposedBudget)
  @Transform(({ value }) => value?.toLowerCase())
  proposedBudget?: ProposedBudget;

  @ApiProperty({
    description: 'Project timeline',
    enum: ProjectTimeline,
    example: ProjectTimeline.one_to_three_months,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectTimeline)
  @Transform(({ value }) => value?.toLowerCase())
  projectTimeline?: ProjectTimeline;

  @ApiProperty({
    description: 'Detailed project description',
    example: 'We need a custom web application for our business...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  projectDetails?: string;

  @ApiProperty({
    description: 'Status of the contact us entry',
    enum: ContactStatus,
    example: ContactStatus.initiated,
    required: false,
  })
  @IsOptional()
  @IsEnum(ContactStatus)
  @Transform(({ value }) => value?.toLowerCase())
  status?: ContactStatus;
}
