import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { CreateAdminUserDto } from './create-user.dto';

export class UpdateAdminUserDto extends PartialType(
  OmitType(CreateAdminUserDto, ['password'] as const),
) {
  @ApiPropertyOptional({
    description: 'Set to clear profile picture (removes stored object when key is known)',
  })
  @IsOptional()
  @IsBoolean()
  clearDisplayPicture?: boolean;

  @ApiPropertyOptional({ description: 'New password (min 8 chars)' })
  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @MinLength(8)
  password?: string;
}
