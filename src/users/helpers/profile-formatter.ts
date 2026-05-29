import { formatDate } from '../../common/helper-functions/formatter';
import type { Prisma } from '../../prisma/client';
import type {
  UserProfileAddress,
  UserProfileBankAccount,
  UserProfileBasicDetails,
  UserProfileContactAddress,
  UserProfileData,
  UserProfileDepartment,
  UserProfileEmployment,
  UserProfileMedicalDetails,
  UserProfilePersonalDetails,
} from '../types/user-profile.types';

const REDACTED_PASSWORD = '••••••••';

export const USER_PROFILE_INCLUDE = {
  department: { select: { id: true, name: true } },
  profile: {
    include: {
      addresses: {
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
      bankAccounts: {
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
      emergencyContacts: {
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
      nextOfKin: {
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
      employments: {
        include: {
          department: { select: { id: true, name: true } },
        },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
    },
  },
} satisfies Prisma.UserInclude;

type ProfileRecord = Prisma.UserGetPayload<{
  include: typeof USER_PROFILE_INCLUDE;
}>;

export function maskAccountNumber(accountNumber: string | null): string | null {
  if (!accountNumber) {
    return null;
  }

  const trimmed = accountNumber.trim();
  if (trimmed.length <= 4) {
    return '••••';
  }

  return `${'•'.repeat(Math.max(trimmed.length - 4, 4))}${trimmed.slice(-4)}`;
}

function formatDepartment(
  department: { id: string; name: string } | null,
): UserProfileDepartment | null {
  return department ? { id: department.id, name: department.name } : null;
}

function formatDateOnly(date: Date | null): string | null {
  if (!date) {
    return null;
  }

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatBasicDetails(user: ProfileRecord): UserProfileBasicDetails {
  const profile = user.profile;

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    preferredName: profile?.preferredName ?? null,
    email: user.email,
    officialEmail: user.email,
    personalEmail: profile?.personalEmail ?? null,
    password: REDACTED_PASSWORD,
    dateOfBirth: formatDateOnly(profile?.dateOfBirth ?? null),
    gender: profile?.gender ?? null,
    phoneNumber: profile?.phoneNumber ?? null,
    secondaryPhoneNumber: profile?.secondaryPhoneNumber ?? null,
    maritalStatus: profile?.maritalStatus ?? null,
    nationality: profile?.nationality ?? null,
  };
}

function formatAddresses(profile: ProfileRecord['profile']): UserProfileAddress[] {
  if (!profile?.addresses?.length) {
    return [];
  }

  return profile.addresses.map((address) => ({
    id: address.id,
    addressType: address.addressType,
    state: address.state,
    city: address.city,
    closestLandmark: address.closestLandmark,
    fullAddress: address.fullAddress,
    postalCode: address.postalCode,
    country: address.country,
    addressProofType: address.addressProofType,
    addressProofUrl: address.addressProofUrl,
    isPrimary: address.isPrimary,
  }));
}

function formatBankAccounts(
  profile: ProfileRecord['profile'],
): UserProfileBankAccount[] {
  if (!profile?.bankAccounts?.length) {
    return [];
  }

  return profile.bankAccounts.map((account) => ({
    id: account.id,
    bankName: account.bankName,
    accountNumber: maskAccountNumber(account.accountNumber),
    accountName: account.accountName,
    isPrimary: account.isPrimary,
  }));
}

function formatMedicalDetails(
  profile: ProfileRecord['profile'],
): UserProfileMedicalDetails {
  return {
    bloodGroup: profile?.bloodGroup ?? null,
    knownMedicalConditions: profile?.knownMedicalConditions ?? [],
    allergies: profile?.allergies ?? [],
  };
}

function formatContacts(
  contacts: NonNullable<ProfileRecord['profile']>['emergencyContacts'],
): UserProfileContactAddress[] {
  if (!contacts?.length) {
    return [];
  }

  return contacts.map((contact) => ({
    id: contact.id,
    fullName: contact.fullName,
    relationship: contact.relationship,
    phoneNumber: contact.phoneNumber,
    email: contact.email,
    state: contact.state,
    city: contact.city,
    closestLandmark: contact.closestLandmark,
    fullAddress: contact.fullAddress,
    postalCode: contact.postalCode,
    country: contact.country,
    isPrimary: contact.isPrimary,
  }));
}

function formatEmployments(
  profile: ProfileRecord['profile'],
): UserProfileEmployment[] {
  if (!profile?.employments?.length) {
    return [];
  }

  return profile.employments.map((employment) => ({
    id: employment.id,
    jobTitle: employment.jobTitle,
    department: formatDepartment(employment.department),
    employmentType: employment.employmentType,
    dateOfJoining: formatDateOnly(employment.dateOfJoining),
    workLocation: employment.workLocation,
    isPrimary: employment.isPrimary,
  }));
}

function formatPersonalDetails(
  profile: ProfileRecord['profile'],
): UserProfilePersonalDetails {
  return {
    funFact: profile?.funFact ?? null,
    hobbies: profile?.hobbies ?? [],
    supportNeeded: profile?.supportNeeded ?? null,
  };
}

export function formatUserProfile(user: ProfileRecord): UserProfileData {
  const primaryEmployment =
    user.profile?.employments?.find((item) => item.isPrimary) ??
    user.profile?.employments?.[0];

  const department =
    formatDepartment(user.department) ??
    formatDepartment(primaryEmployment?.department ?? null);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: String(user.role),
    userType: String(user.userType),
    isActive: user.isActive,
    department,
    displayPictureUrl: user.displayPictureUrl,
    ninImageUrl: user.profile?.ninImageUrl ?? null,
    nyscCertificateUrl: user.profile?.nyscCertificateUrl ?? null,
    staffId: user.profile?.staffId ?? null,
    createdAt: formatDate(user.createdAt),
    updatedAt: formatDate(user.updatedAt),
    basicDetails: formatBasicDetails(user),
    addresses: formatAddresses(user.profile),
    bankAccounts: formatBankAccounts(user.profile),
    medicalDetails: formatMedicalDetails(user.profile),
    emergencyContacts: formatContacts(user.profile?.emergencyContacts ?? []),
    nextOfKin: formatContacts(user.profile?.nextOfKin ?? []),
    employments: formatEmployments(user.profile),
    personalDetails: formatPersonalDetails(user.profile),
  };
}
