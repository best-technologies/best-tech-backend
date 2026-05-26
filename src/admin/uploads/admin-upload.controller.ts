import {
  BadRequestException,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guards';
import { Roles } from '../../common/decorators/roles.decorator';
import { StorageService } from '../../common/storage/storage.service';
import { successResponse } from '../../utils/response';

const ALLOWED_AVATAR_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

@ApiTags('Admin - Uploads')
@Controller('admin/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminUploadController {
  constructor(private readonly storageService: StorageService) {}

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: MAX_AVATAR_BYTES },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('Avatar file is required');
    }

    const mimetype = (file.mimetype || '').toLowerCase();
    if (!ALLOWED_AVATAR_MIMES.has(mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: JPEG, PNG, WebP',
      );
    }

    const stored = await this.storageService.uploadImage(
      { buffer: file.buffer, mimetype },
      'users/avatars',
    );

    const result = successResponse(
      201,
      true,
      'Avatar uploaded successfully',
      1,
      {
        url: stored.url,
        key: stored.key,
      },
    );
    res.status(result.statusCode);
    return result;
  }
}
