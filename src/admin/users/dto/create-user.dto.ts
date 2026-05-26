import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Role, UserType } from '../../../prisma/client';

export class CreateAdminUserDto {
  @ApiProperty({ example: 'Ada' })
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty({ example: 'Lovelace' })
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiProperty({ example: 'ada@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Initial password',
    example: 'SecurePass123!',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: Role, default: Role.user })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ enum: UserType, default: UserType.STAFF })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  departmentId?: string | null;

  @ApiPropertyOptional({
    description: 'Public avatar URL returned from avatar upload endpoint',
  })
  @IsOptional()
  @IsString()
  displayPictureUrl?: string;

  @ApiPropertyOptional({
    description: 'Storage key returned from avatar upload endpoint',
  })
  @IsOptional()
  @IsString()
  displayPictureKey?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  isActive?: boolean;
}
