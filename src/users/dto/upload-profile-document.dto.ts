import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum UserProfileDocumentType {
  NIN_IMAGE = 'nin-image',
  NYSC_CERTIFICATE = 'nysc-certificate',
}

export class UploadProfileDocumentDto {
  @ApiProperty({ enum: UserProfileDocumentType })
  @IsEnum(UserProfileDocumentType)
  imageType!: UserProfileDocumentType;
}
