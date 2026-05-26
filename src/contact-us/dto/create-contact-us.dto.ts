import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ContactSubject, ProposedBudget, ProjectTimeline, ContactUsProjectType } from '../../prisma/client';
import { Transform } from 'class-transformer';

export class CreateContactUsDto {
  @ApiProperty({
    description: 'Full name of the person contacting',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  fullName: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

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
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  phoneNumber: string;

  @ApiProperty({
    description: 'Subject of the inquiry',
    enum: ContactSubject,
    example: ContactSubject.general_enquiry,
  })
  @IsEnum(ContactSubject)
  @Transform(({ value }) => value.toLowerCase())
  subject: ContactSubject;

  @ApiProperty({
    description: 'Proposed budget for the project',
    enum: ProposedBudget,
    example: ProposedBudget.one_million,
  })
  @IsEnum(ProposedBudget)
  @Transform(({ value }) => value.toLowerCase())
  proposedBudget: ProposedBudget;

  @ApiProperty({
    description: 'Project timeline',
    enum: ProjectTimeline,
    example: ProjectTimeline.one_to_three_months,
  })
  @IsEnum(ProjectTimeline)
  @Transform(({ value }) => value.toLowerCase())
  projectTimeline: ProjectTimeline;

  @ApiProperty({
    description: 'Detailed project description',
    example: 'We need a custom web application for our business...',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  projectDetails: string;

  @ApiProperty({
    description: 'Project type',
    enum: ContactUsProjectType,
    example: ContactUsProjectType.general_enquiry,
  })
  @IsEnum(ContactUsProjectType)
  @Transform(({ value }) => value.toLowerCase())
  projectType: ContactUsProjectType;
} 