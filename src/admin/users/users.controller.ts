import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guards';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUsersService } from './users.service';
import { QueryUsersDashboardDto } from './dto/query-users-dashboard.dto';
import { CreateAdminUserDto } from './dto/create-user.dto';
import { UpdateAdminUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from '../../users/dto/update-user-profile.dto';
import { UploadUserProfileImageDto, AdminProfileImageType } from './dto/upload-user-profile-image.dto';
import { UsersControllerDocs } from './doc/user.doc';
import { failureResponse } from '../../utils/response';

@UsersControllerDocs()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('dashboard')
  async getDashboard(
    @Query() query: QueryUsersDashboardDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.getDashboard(query);
    res.status(result.statusCode);
    return result;
  }

  @Get('profile')
  async getProfile(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authUser = req.user as { userId?: string; _id?: string } | undefined;
    const userId = authUser?.userId ?? authUser?._id;

    if (!userId) {
      res.status(401);
      return failureResponse(401, 'Unauthorized', false);
    }

    const result = await this.adminUsersService.getProfile(userId);
    res.status(result.statusCode);
    return result;
  }

  @Post()
  async create(
    @Body() dto: CreateAdminUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.create(dto);
    res.status(result.statusCode);
    return result;
  }

  @Get(':id/profile')
  async getUserProfileById(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.getProfile(id);
    res.status(result.statusCode);
    return result;
  }

  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update a user profile fields (admin)' })
  async updateUserProfileById(
    @Param('id') id: string,
    @Body() dto: UpdateUserProfileDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.updateUserProfile(id, dto);
    res.status(result.statusCode);
    return result;
  }

  @Put(':id/profile/images')
  @ApiOperation({
    summary:
      'Upload or replace profile images (display picture, NIN, NYSC, address proof)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['imageType', 'file'],
      properties: {
        imageType: {
          type: 'string',
          enum: [
            'display-picture',
            'nin-image',
            'nysc-certificate',
            'address-proof',
          ],
        },
        addressId: {
          type: 'string',
          description: 'Required when imageType is address-proof',
        },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserProfileImage(
    @Param('id') id: string,
    @Body() dto: UploadUserProfileImageDto,
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.uploadProfileImage(
      id,
      dto,
      file,
    );
    res.status(result.statusCode);
    return result;
  }

  @Delete(':id/profile/images')
  @ApiOperation({
    summary: 'Remove a user NIN image or NYSC certificate (admin only)',
  })
  async removeUserProfileDocument(
    @Param('id') id: string,
    @Query('imageType') imageType: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (
      imageType !== AdminProfileImageType.NIN_IMAGE &&
      imageType !== AdminProfileImageType.NYSC_CERTIFICATE
    ) {
      res.status(400);
      return failureResponse(
        400,
        'imageType must be nin-image or nysc-certificate',
        false,
      );
    }

    const result = await this.adminUsersService.removeProfileDocument(
      id,
      imageType as
        | AdminProfileImageType.NIN_IMAGE
        | AdminProfileImageType.NYSC_CERTIFICATE,
    );
    res.status(result.statusCode);
    return result;
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.findOne(id);
    res.status(result.statusCode);
    return result;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.update(id, dto);
    res.status(result.statusCode);
    return result;
  }

  @Patch(':id/deactivate')
  async deactivate(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.deactivate(id);
    res.status(result.statusCode);
    return result;
  }
}
