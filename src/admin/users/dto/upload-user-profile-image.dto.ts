import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';

export enum AdminProfileImageType {
  DISPLAY_PICTURE = 'display-picture',
  NIN_IMAGE = 'nin-image',
  NYSC_CERTIFICATE = 'nysc-certificate',
  ADDRESS_PROOF = 'address-proof',
}

export class UploadUserProfileImageDto {
  @ApiProperty({ enum: AdminProfileImageType })
  @IsEnum(AdminProfileImageType)
  imageType!: AdminProfileImageType;

  @ApiPropertyOptional({
    description: 'Required when imageType is address-proof',
  })
  @ValidateIf((dto) => dto.imageType === AdminProfileImageType.ADDRESS_PROOF)
  @IsString()
  addressId?: string;
}
