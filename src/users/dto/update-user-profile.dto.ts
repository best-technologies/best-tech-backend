import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  AddressProofType,
  AddressType,
  EmploymentType,
  Gender,
  MaritalStatus,
  WorkLocation,
} from '../../prisma/client';

export class UpdateUserProfileBasicDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  personalEmail?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string | null;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondaryPhoneNumber?: string | null;

  @ApiPropertyOptional({ enum: MaritalStatus })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string | null;
}

export class UpdateUserProfileAddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ enum: AddressType })
  @IsOptional()
  @IsEnum(AddressType)
  addressType?: AddressType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  closestLandmark?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullAddress?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string | null;

  @ApiPropertyOptional({ enum: AddressProofType })
  @IsOptional()
  @IsEnum(AddressProofType)
  addressProofType?: AddressProofType | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressProofUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressProofKey?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateUserProfileBankAccountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountNumber?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateUserProfileMedicalDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bloodGroup?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  knownMedicalConditions?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];
}

export class UpdateUserProfileContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationship?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  closestLandmark?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullAddress?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateUserProfileEmploymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobTitle?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string | null;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfJoining?: string | null;

  @ApiPropertyOptional({ enum: WorkLocation })
  @IsOptional()
  @IsEnum(WorkLocation)
  workLocation?: WorkLocation | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateUserProfilePersonalDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  funFact?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hobbies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supportNeeded?: string | null;
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserProfileBasicDetailsDto)
  basicDetails?: UpdateUserProfileBasicDetailsDto;

  @ApiPropertyOptional({ type: [UpdateUserProfileAddressDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserProfileAddressDto)
  addresses?: UpdateUserProfileAddressDto[];

  @ApiPropertyOptional({ type: [UpdateUserProfileBankAccountDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserProfileBankAccountDto)
  bankAccounts?: UpdateUserProfileBankAccountDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserProfileMedicalDetailsDto)
  medicalDetails?: UpdateUserProfileMedicalDetailsDto;

  @ApiPropertyOptional({ type: [UpdateUserProfileContactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserProfileContactDto)
  emergencyContacts?: UpdateUserProfileContactDto[];

  @ApiPropertyOptional({ type: [UpdateUserProfileContactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserProfileContactDto)
  nextOfKin?: UpdateUserProfileContactDto[];

  @ApiPropertyOptional({ type: [UpdateUserProfileEmploymentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserProfileEmploymentDto)
  employments?: UpdateUserProfileEmploymentDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserProfilePersonalDetailsDto)
  personalDetails?: UpdateUserProfilePersonalDetailsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  staffId?: string | null;
}
