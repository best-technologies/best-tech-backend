import type { Prisma } from '../../prisma/client';
import { USER_PROFILE_INCLUDE } from './profile-formatter';
import {
  PROFILE_COMPLETION_SECTIONS,
  PROFILE_COMPLETION_TOTAL_SECTIONS,
  type ProfileCompletionFieldDef,
  type ProfileCompletionSectionConfig,
} from './profile-completion.config';
import type {
  ProfileCompletionData,
  ProfileCompletionSection,
  ProfileCompletionSectionId,
} from '../types/profile-completion.types';

type ProfileRecord = Prisma.UserGetPayload<{
  include: typeof USER_PROFILE_INCLUDE;
}>;

type FieldValue =
  | string
  | null
  | undefined
  | boolean
  | string[]
  | Date
  | number;

function hasFieldValue(value: FieldValue): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value != null;
}

function scoreFields(
  record: Record<string, unknown>,
  fields: ProfileCompletionFieldDef[],
): { completed: number; missing: string[] } {
  let completed = 0;
  const missing: string[] = [];

  for (const field of fields) {
    if (hasFieldValue(record[field.key] as FieldValue)) {
      completed += 1;
    } else {
      missing.push(field.label);
    }
  }

  return { completed, missing };
}

function scoreSectionFields(
  config: ProfileCompletionSectionConfig,
  record: Record<string, unknown>,
): Pick<
  ProfileCompletionSection,
  | 'percent'
  | 'requiredCompleted'
  | 'requiredTotal'
  | 'optionalCompleted'
  | 'optionalTotal'
  | 'missingRequired'
  | 'missingOptional'
> {
  const required = scoreFields(record, config.required);
  const optional = scoreFields(record, config.optional);

  const requiredTotal = config.required.length;
  const optionalTotal = config.optional.length;
  const percent =
    requiredTotal === 0
      ? 100
      : Math.round((required.completed / requiredTotal) * 100);

  return {
    percent,
    requiredCompleted: required.completed,
    requiredTotal,
    optionalCompleted: optional.completed,
    optionalTotal,
    missingRequired: required.missing,
    missingOptional: optional.missing,
  };
}

function pickBestCollectionRecord<T extends Record<string, unknown>>(
  records: T[],
  config: ProfileCompletionSectionConfig,
): T | null {
  if (records.length === 0) {
    return null;
  }

  const primary = records.find((record) => record.isPrimary === true);
  if (primary) {
    return primary;
  }

  let bestRecord = records[0];
  let bestScore = -1;

  for (const record of records) {
    const { completed } = scoreFields(record, config.required);
    if (completed > bestScore) {
      bestScore = completed;
      bestRecord = record;
    }
  }

  return bestRecord;
}

function emptyCollectionSection(
  config: ProfileCompletionSectionConfig,
): Pick<
  ProfileCompletionSection,
  | 'percent'
  | 'requiredCompleted'
  | 'requiredTotal'
  | 'optionalCompleted'
  | 'optionalTotal'
  | 'missingRequired'
  | 'missingOptional'
> {
  return {
    percent: 0,
    requiredCompleted: 0,
    requiredTotal: config.required.length,
    optionalCompleted: 0,
    optionalTotal: config.optional.length,
    missingRequired: config.required.map((field) => field.label),
    missingOptional: config.optional.map((field) => field.label),
  };
}

function buildBasicRecord(user: ProfileRecord): Record<string, FieldValue> {
  const profile = user.profile;

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    displayPictureUrl: user.displayPictureUrl,
    preferredName: profile?.preferredName ?? null,
    personalEmail: profile?.personalEmail ?? null,
    dateOfBirth: profile?.dateOfBirth ?? null,
    gender: profile?.gender ?? null,
    phoneNumber: profile?.phoneNumber ?? null,
    secondaryPhoneNumber: profile?.secondaryPhoneNumber ?? null,
    maritalStatus: profile?.maritalStatus ?? null,
    nationality: profile?.nationality ?? null,
  };
}

function buildMedicalRecord(user: ProfileRecord): Record<string, FieldValue> {
  const profile = user.profile;

  return {
    bloodGroup: profile?.bloodGroup ?? null,
    knownMedicalConditions: profile?.knownMedicalConditions ?? [],
    allergies: profile?.allergies ?? [],
  };
}

function buildPersonalRecord(user: ProfileRecord): Record<string, FieldValue> {
  const profile = user.profile;

  return {
    funFact: profile?.funFact ?? null,
    hobbies: profile?.hobbies ?? [],
    supportNeeded: profile?.supportNeeded ?? null,
  };
}

function scoreSection(
  user: ProfileRecord,
  config: ProfileCompletionSectionConfig,
): ProfileCompletionSection {
  let scores: Pick<
    ProfileCompletionSection,
    | 'percent'
    | 'requiredCompleted'
    | 'requiredTotal'
    | 'optionalCompleted'
    | 'optionalTotal'
    | 'missingRequired'
    | 'missingOptional'
  >;

  switch (config.id) {
    case 'basic':
      scores = scoreSectionFields(config, buildBasicRecord(user));
      break;
    case 'address': {
      const records = user.profile?.addresses ?? [];
      const best = pickBestCollectionRecord(records, config);
      scores = best
        ? scoreSectionFields(config, best)
        : emptyCollectionSection(config);
      break;
    }
    case 'bank': {
      const records = user.profile?.bankAccounts ?? [];
      const best = pickBestCollectionRecord(records, config);
      scores = best
        ? scoreSectionFields(config, best)
        : emptyCollectionSection(config);
      break;
    }
    case 'medical':
      scores = scoreSectionFields(config, buildMedicalRecord(user));
      break;
    case 'emergency': {
      const records = user.profile?.emergencyContacts ?? [];
      const best = pickBestCollectionRecord(records, config);
      scores = best
        ? scoreSectionFields(config, best)
        : emptyCollectionSection(config);
      break;
    }
    case 'next-of-kin': {
      const records = user.profile?.nextOfKin ?? [];
      const best = pickBestCollectionRecord(records, config);
      scores = best
        ? scoreSectionFields(config, best)
        : emptyCollectionSection(config);
      break;
    }
    case 'employment': {
      const records = user.profile?.employments ?? [];
      const best = pickBestCollectionRecord(records, config);
      scores = best
        ? scoreSectionFields(config, best)
        : emptyCollectionSection(config);
      break;
    }
    case 'personal':
      scores = scoreSectionFields(config, buildPersonalRecord(user));
      break;
    default:
      scores = emptyCollectionSection(config);
  }

  return {
    id: config.id as ProfileCompletionSectionId,
    label: config.label,
    weight: config.weight,
    ...scores,
  };
}

export function calculateProfileCompletion(
  user: ProfileRecord,
): ProfileCompletionData {
  const sections = PROFILE_COMPLETION_SECTIONS.map((config) =>
    scoreSection(user, config),
  );

  const overallPercent = Math.round(
    sections.reduce(
      (total, section) => total + (section.weight * section.percent) / 100,
      0,
    ),
  );

  const completedSections = sections.filter(
    (section) => section.percent === 100,
  ).length;

  return {
    overallPercent,
    completedSections,
    totalSections: PROFILE_COMPLETION_TOTAL_SECTIONS,
    sections,
  };
}
