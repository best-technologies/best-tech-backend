import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
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
        if (dto.basicDetails) {
          const { firstName, lastName, ...profileFields } = dto.basicDetails;

          if (firstName || lastName) {
            await tx.user.update({
              where: { id: userId },
              data: {
                ...(firstName ? { firstName } : {}),
                ...(lastName ? { lastName } : {}),
              },
            });
          }

          await tx.userProfile.update({
            where: { id: profile.id },
            data: {
              ...(profileFields.preferredName !== undefined
                ? { preferredName: profileFields.preferredName }
                : {}),
              ...(profileFields.personalEmail !== undefined
                ? { personalEmail: profileFields.personalEmail }
                : {}),
              ...(profileFields.dateOfBirth !== undefined
                ? {
                    dateOfBirth: profileFields.dateOfBirth
                      ? new Date(profileFields.dateOfBirth)
                      : null,
                  }
                : {}),
              ...(profileFields.gender !== undefined
                ? { gender: profileFields.gender }
                : {}),
              ...(profileFields.phoneNumber !== undefined
                ? { phoneNumber: profileFields.phoneNumber }
                : {}),
              ...(profileFields.secondaryPhoneNumber !== undefined
                ? { secondaryPhoneNumber: profileFields.secondaryPhoneNumber }
                : {}),
              ...(profileFields.maritalStatus !== undefined
                ? { maritalStatus: profileFields.maritalStatus }
                : {}),
              ...(profileFields.nationality !== undefined
                ? { nationality: profileFields.nationality }
                : {}),
            },
          });
        }

        if (dto.staffId !== undefined) {
          await tx.userProfile.update({
            where: { id: profile.id },
            data: { staffId: dto.staffId },
          });
        }

        if (dto.medicalDetails) {
          await tx.userProfile.update({
            where: { id: profile.id },
            data: {
              ...(dto.medicalDetails.bloodGroup !== undefined
                ? { bloodGroup: dto.medicalDetails.bloodGroup }
                : {}),
              ...(dto.medicalDetails.knownMedicalConditions !== undefined
                ? {
                    knownMedicalConditions:
                      dto.medicalDetails.knownMedicalConditions,
                  }
                : {}),
              ...(dto.medicalDetails.allergies !== undefined
                ? { allergies: dto.medicalDetails.allergies }
                : {}),
            },
          });
        }

        if (dto.personalDetails) {
          await tx.userProfile.update({
            where: { id: profile.id },
            data: {
              ...(dto.personalDetails.funFact !== undefined
                ? { funFact: dto.personalDetails.funFact }
                : {}),
              ...(dto.personalDetails.hobbies !== undefined
                ? { hobbies: dto.personalDetails.hobbies }
                : {}),
              ...(dto.personalDetails.supportNeeded !== undefined
                ? { supportNeeded: dto.personalDetails.supportNeeded }
                : {}),
            },
          });
        }

        if (dto.addresses) {
          await tx.userAddress.deleteMany({ where: { userProfileId: profile.id } });
          if (dto.addresses.length > 0) {
            await tx.userAddress.createMany({
              data: dto.addresses.map((address) => ({
                userProfileId: profile.id,
                addressType: address.addressType ?? 'CURRENT',
                state: address.state ?? null,
                city: address.city ?? null,
                closestLandmark: address.closestLandmark ?? null,
                fullAddress: address.fullAddress ?? null,
                postalCode: address.postalCode ?? null,
                country: address.country ?? null,
                addressProofType: address.addressProofType ?? null,
                addressProofUrl: address.addressProofUrl ?? null,
                addressProofKey: address.addressProofKey ?? null,
                isPrimary: address.isPrimary ?? false,
              })),
            });
          }
        }

        if (dto.bankAccounts) {
          await tx.userBankAccount.deleteMany({
            where: { userProfileId: profile.id },
          });
          if (dto.bankAccounts.length > 0) {
            await tx.userBankAccount.createMany({
              data: dto.bankAccounts.map((account) => ({
                userProfileId: profile.id,
                bankName: account.bankName ?? null,
                accountNumber: account.accountNumber ?? null,
                accountName: account.accountName ?? null,
                isPrimary: account.isPrimary ?? false,
              })),
            });
          }
        }

        if (dto.emergencyContacts) {
          await tx.userEmergencyContact.deleteMany({
            where: { userProfileId: profile.id },
          });
          if (dto.emergencyContacts.length > 0) {
            await tx.userEmergencyContact.createMany({
              data: dto.emergencyContacts.map((contact) => ({
                userProfileId: profile.id,
                fullName: contact.fullName ?? null,
                relationship: contact.relationship ?? null,
                phoneNumber: contact.phoneNumber ?? null,
                email: contact.email ?? null,
                state: contact.state ?? null,
                city: contact.city ?? null,
                closestLandmark: contact.closestLandmark ?? null,
                fullAddress: contact.fullAddress ?? null,
                postalCode: contact.postalCode ?? null,
                country: contact.country ?? null,
                isPrimary: contact.isPrimary ?? false,
              })),
            });
          }
        }

        if (dto.nextOfKin) {
          await tx.userNextOfKin.deleteMany({
            where: { userProfileId: profile.id },
          });
          if (dto.nextOfKin.length > 0) {
            await tx.userNextOfKin.createMany({
              data: dto.nextOfKin.map((contact) => ({
                userProfileId: profile.id,
                fullName: contact.fullName ?? null,
                relationship: contact.relationship ?? null,
                phoneNumber: contact.phoneNumber ?? null,
                email: contact.email ?? null,
                state: contact.state ?? null,
                city: contact.city ?? null,
                closestLandmark: contact.closestLandmark ?? null,
                fullAddress: contact.fullAddress ?? null,
                postalCode: contact.postalCode ?? null,
                country: contact.country ?? null,
                isPrimary: contact.isPrimary ?? false,
              })),
            });
          }
        }

        if (dto.employments) {
          await tx.userEmployment.deleteMany({
            where: { userProfileId: profile.id },
          });
          if (dto.employments.length > 0) {
            await tx.userEmployment.createMany({
              data: dto.employments.map((employment) => ({
                userProfileId: profile.id,
                jobTitle: employment.jobTitle ?? null,
                departmentId: employment.departmentId ?? null,
                employmentType: employment.employmentType ?? null,
                dateOfJoining: employment.dateOfJoining
                  ? new Date(employment.dateOfJoining)
                  : null,
                workLocation: employment.workLocation ?? null,
                isPrimary: employment.isPrimary ?? false,
              })),
            });
          }
        }
      });

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
        'Profile updated successfully',
        1,
        formatUserProfile(user),
      );
    } catch {
      return failureResponse(500, 'Error updating user profile', false);
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

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
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
