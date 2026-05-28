import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../prisma/client';
import type {
  UpdateUserProfileAddressDto,
  UpdateUserProfileBankAccountDto,
  UpdateUserProfileBasicDetailsDto,
  UpdateUserProfileContactDto,
  UpdateUserProfileDto,
  UpdateUserProfileEmploymentDto,
  UpdateUserProfileMedicalDetailsDto,
  UpdateUserProfilePersonalDetailsDto,
} from '../dto/update-user-profile.dto';

type TransactionClient = Prisma.TransactionClient;

export function buildPartialData<T extends object>(
  input: T,
  keys: (keyof T)[],
): Partial<T> {
  const data: Partial<T> = {};
  for (const key of keys) {
    if (input[key] !== undefined) {
      data[key] = input[key];
    }
  }
  return data;
}

export function hasProfileUpdatePayload(dto: UpdateUserProfileDto): boolean {
  return (
    dto.basicDetails !== undefined ||
    dto.medicalDetails !== undefined ||
    dto.personalDetails !== undefined ||
    dto.staffId !== undefined ||
    (dto.addresses !== undefined && dto.addresses.length > 0) ||
    (dto.addressDeletes !== undefined && dto.addressDeletes.length > 0) ||
    (dto.bankAccounts !== undefined && dto.bankAccounts.length > 0) ||
    (dto.bankAccountDeletes !== undefined &&
      dto.bankAccountDeletes.length > 0) ||
    (dto.emergencyContacts !== undefined &&
      dto.emergencyContacts.length > 0) ||
    (dto.emergencyContactDeletes !== undefined &&
      dto.emergencyContactDeletes.length > 0) ||
    (dto.nextOfKin !== undefined && dto.nextOfKin.length > 0) ||
    (dto.nextOfKinDeletes !== undefined && dto.nextOfKinDeletes.length > 0) ||
    (dto.employments !== undefined && dto.employments.length > 0) ||
    (dto.employmentDeletes !== undefined && dto.employmentDeletes.length > 0)
  );
}

export async function applyBasicDetailsUpdate(
  tx: TransactionClient,
  userId: string,
  profileId: string,
  dto: UpdateUserProfileBasicDetailsDto,
): Promise<void> {
  const { firstName, lastName, ...profileFields } = dto;

  const userData = buildPartialData(
    { firstName, lastName },
    ['firstName', 'lastName'],
  );
  if (Object.keys(userData).length > 0) {
    await tx.user.update({
      where: { id: userId },
      data: userData,
    });
  }

  const profileData: Prisma.UserProfileUpdateInput = {};

  if (profileFields.preferredName !== undefined) {
    profileData.preferredName = profileFields.preferredName;
  }
  if (profileFields.personalEmail !== undefined) {
    profileData.personalEmail = profileFields.personalEmail;
  }
  if (profileFields.dateOfBirth !== undefined) {
    profileData.dateOfBirth = profileFields.dateOfBirth
      ? new Date(profileFields.dateOfBirth)
      : null;
  }
  if (profileFields.gender !== undefined) {
    profileData.gender = profileFields.gender;
  }
  if (profileFields.phoneNumber !== undefined) {
    profileData.phoneNumber = profileFields.phoneNumber;
  }
  if (profileFields.secondaryPhoneNumber !== undefined) {
    profileData.secondaryPhoneNumber = profileFields.secondaryPhoneNumber;
  }
  if (profileFields.maritalStatus !== undefined) {
    profileData.maritalStatus = profileFields.maritalStatus;
  }
  if (profileFields.nationality !== undefined) {
    profileData.nationality = profileFields.nationality;
  }

  if (Object.keys(profileData).length > 0) {
    await tx.userProfile.update({
      where: { id: profileId },
      data: profileData,
    });
  }
}

export async function applyMedicalDetailsUpdate(
  tx: TransactionClient,
  profileId: string,
  dto: UpdateUserProfileMedicalDetailsDto,
): Promise<void> {
  const data = buildPartialData(dto, [
    'bloodGroup',
    'knownMedicalConditions',
    'allergies',
  ]);
  if (Object.keys(data).length === 0) return;

  await tx.userProfile.update({
    where: { id: profileId },
    data,
  });
}

export async function applyPersonalDetailsUpdate(
  tx: TransactionClient,
  profileId: string,
  dto: UpdateUserProfilePersonalDetailsDto,
): Promise<void> {
  const data = buildPartialData(dto, ['funFact', 'hobbies', 'supportNeeded']);
  if (Object.keys(data).length === 0) return;

  await tx.userProfile.update({
    where: { id: profileId },
    data,
  });
}

async function deleteOwnedRecords(
  tx: TransactionClient,
  profileId: string,
  ids: string[],
  model: 'userAddress' | 'userBankAccount' | 'userEmergencyContact' | 'userNextOfKin' | 'userEmployment',
): Promise<void> {
  if (ids.length === 0) return;

  const deleteMany = {
    userAddress: () =>
      tx.userAddress.deleteMany({
        where: { id: { in: ids }, userProfileId: profileId },
      }),
    userBankAccount: () =>
      tx.userBankAccount.deleteMany({
        where: { id: { in: ids }, userProfileId: profileId },
      }),
    userEmergencyContact: () =>
      tx.userEmergencyContact.deleteMany({
        where: { id: { in: ids }, userProfileId: profileId },
      }),
    userNextOfKin: () =>
      tx.userNextOfKin.deleteMany({
        where: { id: { in: ids }, userProfileId: profileId },
      }),
    userEmployment: () =>
      tx.userEmployment.deleteMany({
        where: { id: { in: ids }, userProfileId: profileId },
      }),
  };

  await deleteMany[model]();
}

export async function applyAddressUpdates(
  tx: TransactionClient,
  profileId: string,
  items: UpdateUserProfileAddressDto[] | undefined,
  deleteIds: string[] | undefined,
): Promise<void> {
  if (deleteIds?.length) {
    await deleteOwnedRecords(tx, profileId, deleteIds, 'userAddress');
  }

  if (!items?.length) return;

  for (const item of items) {
    const { id, ...rest } = item;

    if (id) {
      const existing = await tx.userAddress.findFirst({
        where: { id, userProfileId: profileId },
      });
      if (!existing) {
        throw new NotFoundException(`Address not found: ${id}`);
      }

      const data: Prisma.UserAddressUpdateInput = {};
      if (rest.addressType !== undefined) data.addressType = rest.addressType;
      if (rest.state !== undefined) data.state = rest.state;
      if (rest.city !== undefined) data.city = rest.city;
      if (rest.closestLandmark !== undefined) {
        data.closestLandmark = rest.closestLandmark;
      }
      if (rest.fullAddress !== undefined) data.fullAddress = rest.fullAddress;
      if (rest.postalCode !== undefined) data.postalCode = rest.postalCode;
      if (rest.country !== undefined) data.country = rest.country;
      if (rest.addressProofType !== undefined) {
        data.addressProofType = rest.addressProofType;
      }
      if (rest.isPrimary !== undefined) data.isPrimary = rest.isPrimary;

      if (Object.keys(data).length > 0) {
        await tx.userAddress.update({ where: { id }, data });
      }
    } else {
      await tx.userAddress.create({
        data: {
          userProfileId: profileId,
          addressType: rest.addressType ?? 'CURRENT',
          state: rest.state ?? null,
          city: rest.city ?? null,
          closestLandmark: rest.closestLandmark ?? null,
          fullAddress: rest.fullAddress ?? null,
          postalCode: rest.postalCode ?? null,
          country: rest.country ?? null,
          addressProofType: rest.addressProofType ?? null,
          isPrimary: rest.isPrimary ?? false,
        },
      });
    }
  }
}

export async function applyBankAccountUpdates(
  tx: TransactionClient,
  profileId: string,
  items: UpdateUserProfileBankAccountDto[] | undefined,
  deleteIds: string[] | undefined,
): Promise<void> {
  if (deleteIds?.length) {
    await deleteOwnedRecords(tx, profileId, deleteIds, 'userBankAccount');
  }

  if (!items?.length) return;

  for (const item of items) {
    const { id, ...rest } = item;

    if (id) {
      const existing = await tx.userBankAccount.findFirst({
        where: { id, userProfileId: profileId },
      });
      if (!existing) {
        throw new NotFoundException(`Bank account not found: ${id}`);
      }

      const data = buildPartialData(rest, [
        'bankName',
        'accountNumber',
        'accountName',
        'isPrimary',
      ]);
      if (Object.keys(data).length > 0) {
        await tx.userBankAccount.update({ where: { id }, data });
      }
    } else {
      await tx.userBankAccount.create({
        data: {
          userProfileId: profileId,
          bankName: rest.bankName ?? null,
          accountNumber: rest.accountNumber ?? null,
          accountName: rest.accountName ?? null,
          isPrimary: rest.isPrimary ?? false,
        },
      });
    }
  }
}

export async function applyContactUpdates(
  tx: TransactionClient,
  profileId: string,
  items: UpdateUserProfileContactDto[] | undefined,
  deleteIds: string[] | undefined,
  model: 'userEmergencyContact' | 'userNextOfKin',
): Promise<void> {
  if (deleteIds?.length) {
    await deleteOwnedRecords(tx, profileId, deleteIds, model);
  }

  if (!items?.length) return;

  const contactKeys = [
    'fullName',
    'relationship',
    'phoneNumber',
    'email',
    'state',
    'city',
    'closestLandmark',
    'fullAddress',
    'postalCode',
    'country',
    'isPrimary',
  ] as const;

  for (const item of items) {
    const { id, ...rest } = item;

    if (id) {
      const findFirst =
        model === 'userEmergencyContact'
          ? tx.userEmergencyContact.findFirst.bind(tx.userEmergencyContact)
          : tx.userNextOfKin.findFirst.bind(tx.userNextOfKin);

      const existing = await findFirst({
        where: { id, userProfileId: profileId },
      });
      if (!existing) {
        throw new NotFoundException(`Contact not found: ${id}`);
      }

      const data = buildPartialData(rest, [...contactKeys]);
      if (Object.keys(data).length > 0) {
        if (model === 'userEmergencyContact') {
          await tx.userEmergencyContact.update({ where: { id }, data });
        } else {
          await tx.userNextOfKin.update({ where: { id }, data });
        }
      }
    } else {
      const createData = {
        userProfileId: profileId,
        fullName: rest.fullName ?? null,
        relationship: rest.relationship ?? null,
        phoneNumber: rest.phoneNumber ?? null,
        email: rest.email ?? null,
        state: rest.state ?? null,
        city: rest.city ?? null,
        closestLandmark: rest.closestLandmark ?? null,
        fullAddress: rest.fullAddress ?? null,
        postalCode: rest.postalCode ?? null,
        country: rest.country ?? null,
        isPrimary: rest.isPrimary ?? false,
      };

      if (model === 'userEmergencyContact') {
        await tx.userEmergencyContact.create({ data: createData });
      } else {
        await tx.userNextOfKin.create({ data: createData });
      }
    }
  }
}

export async function applyEmploymentUpdates(
  tx: TransactionClient,
  profileId: string,
  items: UpdateUserProfileEmploymentDto[] | undefined,
  deleteIds: string[] | undefined,
): Promise<void> {
  if (deleteIds?.length) {
    await deleteOwnedRecords(tx, profileId, deleteIds, 'userEmployment');
  }

  if (!items?.length) return;

  for (const item of items) {
    const { id, ...rest } = item;

    if (id) {
      const existing = await tx.userEmployment.findFirst({
        where: { id, userProfileId: profileId },
      });
      if (!existing) {
        throw new NotFoundException(`Employment record not found: ${id}`);
      }

      const data: Prisma.UserEmploymentUpdateInput = {};
      if (rest.jobTitle !== undefined) data.jobTitle = rest.jobTitle;
      if (rest.employmentType !== undefined) {
        data.employmentType = rest.employmentType;
      }
      if (rest.dateOfJoining !== undefined) {
        data.dateOfJoining = rest.dateOfJoining
          ? new Date(rest.dateOfJoining)
          : null;
      }
      if (rest.workLocation !== undefined) data.workLocation = rest.workLocation;
      if (rest.isPrimary !== undefined) data.isPrimary = rest.isPrimary;

      if (Object.keys(data).length > 0) {
        await tx.userEmployment.update({ where: { id }, data });
      }
    } else {
      await tx.userEmployment.create({
        data: {
          userProfileId: profileId,
          jobTitle: rest.jobTitle ?? null,
          employmentType: rest.employmentType ?? null,
          dateOfJoining: rest.dateOfJoining
            ? new Date(rest.dateOfJoining)
            : null,
          workLocation: rest.workLocation ?? null,
          isPrimary: rest.isPrimary ?? false,
        },
      });
    }
  }
}

export async function applyProfileUpdates(
  tx: TransactionClient,
  userId: string,
  profileId: string,
  dto: UpdateUserProfileDto,
): Promise<void> {
  if (!hasProfileUpdatePayload(dto)) {
    throw new BadRequestException('No profile fields to update');
  }

  if (dto.basicDetails) {
    await applyBasicDetailsUpdate(tx, userId, profileId, dto.basicDetails);
  }

  if (dto.staffId !== undefined) {
    await tx.userProfile.update({
      where: { id: profileId },
      data: { staffId: dto.staffId },
    });
  }

  if (dto.medicalDetails) {
    await applyMedicalDetailsUpdate(tx, profileId, dto.medicalDetails);
  }

  if (dto.personalDetails) {
    await applyPersonalDetailsUpdate(tx, profileId, dto.personalDetails);
  }

  await applyAddressUpdates(
    tx,
    profileId,
    dto.addresses,
    dto.addressDeletes,
  );
  await applyBankAccountUpdates(
    tx,
    profileId,
    dto.bankAccounts,
    dto.bankAccountDeletes,
  );
  await applyContactUpdates(
    tx,
    profileId,
    dto.emergencyContacts,
    dto.emergencyContactDeletes,
    'userEmergencyContact',
  );
  await applyContactUpdates(
    tx,
    profileId,
    dto.nextOfKin,
    dto.nextOfKinDeletes,
    'userNextOfKin',
  );
  await applyEmploymentUpdates(
    tx,
    profileId,
    dto.employments,
    dto.employmentDeletes,
  );
}
