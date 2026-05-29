import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { ApiResponse } from '../utils/response';
import type { AuthenticatedRequest } from '../identity/types/authenticated-request.interface';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import type { UserProfileData } from './types/user-profile.types';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import {
  UploadProfileDocumentDto,
  UserProfileDocumentType,
} from './dto/upload-profile-document.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get authenticated user dashboard data' })
  getUserDashboard(
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<unknown>> {
    return this.usersService.getUserDashboard(req.user);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  getProfile(
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<UserProfileData>> {
    return this.usersService.getUserProfile(req.user);
  }

  @Patch('profile')
  @ApiOperation({
    summary:
      'Partially update authenticated user profile (only send changed fields/records)',
  })
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<ApiResponse<UserProfileData>> {
    return this.usersService.updateUserProfile(req.user, dto);
  }

  @Put('profile/display-picture')
  @ApiOperation({
    summary: 'Upload or replace authenticated user display picture',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['displayPicture'],
      properties: {
        displayPicture: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('displayPicture'))
  updateDisplayPicture(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<UserProfileData>> {
    return this.usersService.updateDisplayPicture(req.user, file);
  }

  @Put('profile/addresses/:addressId/address-proof')
  @ApiOperation({ summary: 'Upload or replace address proof document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['addressProof'],
      properties: {
        addressProof: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('addressProof'))
  updateAddressProof(
    @Req() req: AuthenticatedRequest,
    @Param('addressId') addressId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<UserProfileData>> {
    return this.usersService.updateAddressProof(req.user, addressId, file);
  }

  @Put('profile/images')
  @ApiOperation({
    summary:
      'Upload NIN image or NYSC certificate (one-time only; cannot replace after upload)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['imageType', 'file'],
      properties: {
        imageType: {
          type: 'string',
          enum: ['nin-image', 'nysc-certificate'],
        },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadProfileDocument(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UploadProfileDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<UserProfileData>> {
    return this.usersService.uploadProfileDocument(req.user, dto, file);
  }
}
