import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import {
  type ApiResponse,
  successResponse,
  failureResponse,
} from '../utils/response';
import { LoggerService } from '../common/logger/logger.service';
import type { JwtAuthUser } from '../identity/types/jwt-auth-user.interface';
import type { UserProfileData } from './types/user-profile.types';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import {
  formatUserProfile,
  USER_PROFILE_INCLUDE,
} from './helpers/profile-formatter';
import { applyProfileUpdates } from './helpers/profile-update.helpers';
import { calculateProfileCompletion } from './helpers/profile-completion.helper';

const ALLOWED_DISPLAY_PICTURE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

const MAX_DISPLAY_PICTURE_BYTES = 5 * 1024 * 1024;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private readonly storageService: StorageService,
  ) {}

  private resolveUserId(authUser: JwtAuthUser | undefined): string | null {
    return authUser?.userId ?? null;
  }

  private async ensureUserProfile(userId: string) {
    return this.prisma.userProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  private async fetchProfileResponse(
    userId: string,
    message: string,
  ): Promise<ApiResponse<UserProfileData>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: USER_PROFILE_INCLUDE,
    });

    if (!user) {
      return failureResponse(404, 'Profile not found', false);
    }

    return successResponse(200, true, message, 1, formatUserProfile(user));
  }

  async getUserProfile(
    authUser: JwtAuthUser | undefined,
  ): Promise<ApiResponse<UserProfileData>> {
    this.logger.log('Getting user profile...', 'UsersService');

    const userId = this.resolveUserId(authUser);

    if (!userId) {
      return failureResponse(401, 'Unauthorized', false);
    }

    try {
      await this.ensureUserProfile(userId);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: USER_PROFILE_INCLUDE,
      });

      if (!user) {
        return failureResponse(404, 'Profile not found', false);
      }

      return successResponse(
        200,
        true,
        'Profile fetched successfully',
        1,
        formatUserProfile(user),
      );
    } catch {
      return failureResponse(500, 'Error retrieving user profile', false);
    }
  }

  async updateUserProfile(
    authUser: JwtAuthUser | undefined,
    dto: UpdateUserProfileDto,
  ): Promise<ApiResponse<UserProfileData>> {
    this.logger.log('Updating user profile...', 'UsersService');

    const userId = this.resolveUserId(authUser);

    if (!userId) {
      return failureResponse(401, 'Unauthorized', false);
    }

    try {
      const profile = await this.ensureUserProfile(userId);

      await this.prisma.$transaction(async (tx) => {
        await applyProfileUpdates(tx, userId, profile.id, dto);
      });

      return this.fetchProfileResponse(userId, 'Profile updated successfully');
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      return failureResponse(500, 'Error updating user profile', false);
    }
  }

  async updateDisplayPicture(
    authUser: JwtAuthUser | undefined,
    file: Express.Multer.File | undefined,
  ): Promise<ApiResponse<UserProfileData>> {
    this.logger.log('Updating user display picture...', 'UsersService');

    const userId = this.resolveUserId(authUser);

    if (!userId) {
      return failureResponse(401, 'Unauthorized', false);
    }

    if (!file?.buffer) {
      throw new BadRequestException('Display picture file is required');
    }

    const mimetype = (file.mimetype || '').toLowerCase();
    if (!ALLOWED_DISPLAY_PICTURE_MIMES.has(mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG');
    }

    if (file.size > MAX_DISPLAY_PICTURE_BYTES) {
      throw new BadRequestException('File is too large. Maximum size is 5MB');
    }

    try {
      const existing = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { displayPictureKey: true },
      });

      if (!existing) {
        return failureResponse(404, 'Profile not found', false);
      }

      const stored = await this.storageService.uploadImage(
        { buffer: file.buffer, mimetype },
        'users/avatars',
      );

      if (existing.displayPictureKey) {
        try {
          await this.storageService.deleteImage(existing.displayPictureKey);
        } catch {
          this.logger.warn(
            `Could not delete old display picture: ${existing.displayPictureKey}`,
            'UsersService',
          );
        }
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          displayPictureUrl: stored.url,
          displayPictureKey: stored.key,
        },
      });

      await this.ensureUserProfile(userId);

      return this.fetchProfileResponse(
        userId,
        'Display picture updated successfully',
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      return failureResponse(500, 'Error updating display picture', false);
    }
  }

  async updateAddressProof(
    authUser: JwtAuthUser | undefined,
    addressId: string,
    file: Express.Multer.File | undefined,
  ): Promise<ApiResponse<UserProfileData>> {
    this.logger.log('Updating address proof...', 'UsersService');

    const userId = this.resolveUserId(authUser);

    if (!userId) {
      return failureResponse(401, 'Unauthorized', false);
    }

    if (!file?.buffer) {
      throw new BadRequestException('Address proof file is required');
    }

    const mimetype = (file.mimetype || '').toLowerCase();
    if (!ALLOWED_DISPLAY_PICTURE_MIMES.has(mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG');
    }

    if (file.size > MAX_DISPLAY_PICTURE_BYTES) {
      throw new BadRequestException('File is too large. Maximum size is 5MB');
    }

    try {
      const profile = await this.ensureUserProfile(userId);

      const address = await this.prisma.userAddress.findFirst({
        where: { id: addressId, userProfileId: profile.id },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      const stored = await this.storageService.uploadImage(
        { buffer: file.buffer, mimetype },
        'users/address-proofs',
      );

      if (address.addressProofKey) {
        try {
          await this.storageService.deleteImage(address.addressProofKey);
        } catch {
          this.logger.warn(
            `Could not delete old address proof: ${address.addressProofKey}`,
            'UsersService',
          );
        }
      }

      await this.prisma.userAddress.update({
        where: { id: addressId },
        data: {
          addressProofUrl: stored.url,
          addressProofKey: stored.key,
        },
      });

      return this.fetchProfileResponse(
        userId,
        'Address proof updated successfully',
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      return failureResponse(500, 'Error updating address proof', false);
    }
  }

  async getUserDashboard(
    authUser: JwtAuthUser | undefined,
  ): Promise<ApiResponse<unknown>> {
    this.logger.log('Getting user dashboard...', 'UsersService');

    const userId = this.resolveUserId(authUser);

    if (!userId) {
      return failureResponse(401, 'Unauthorized', false);
    }

    try {
      this.logger.log('User ID: ' + userId, 'UsersService');

      await this.ensureUserProfile(userId);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          ...USER_PROFILE_INCLUDE,
          staffProfile: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          studentProfile: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
      });

      if (!user) {
        this.logger.error('User not found');
        return failureResponse(404, 'User not found');
      }

      const profileCompletion = calculateProfileCompletion(user);

      const serviceStats = await this.prisma.service.aggregate({
        where: { userId: userId },
        _count: {
          id: true,
        },
      });

      let contactStats: { totalSubmissions: number } | null = null;
      if (user.role === 'admin' || user.role === 'staff') {
        const contactAggregate = await this.prisma.contactUs.aggregate({
          _count: {
            id: true,
          },
        });
        contactStats = {
          totalSubmissions: contactAggregate._count.id || 0,
        };
      }

      const dashboard = {
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          memberSince: user.createdAt,
          isStaff: !!user.staffProfile,
          isStudent: !!user.studentProfile,
        },
        statistics: {
          services: {
            totalCreated: serviceStats._count.id || 0,
          },
          contacts: contactStats,
        },
        profileCompletion,
      };

      this.logger.log('User dashboard retrieved successfully');

      return successResponse(
        200,
        true,
        'User dashboard retrieved successfully',
        undefined,
        dashboard,
      );
    } catch {
      return failureResponse(500, 'Error retrieving user dashboard', false);
    }
  }
}
