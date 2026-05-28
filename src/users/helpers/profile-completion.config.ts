import type { ProfileCompletionSectionId } from '../types/profile-completion.types';

export interface ProfileCompletionFieldDef {
  key: string;
  label: string;
}

export interface ProfileCompletionSectionConfig {
  id: ProfileCompletionSectionId;
  label: string;
  weight: number;
  required: ProfileCompletionFieldDef[];
  optional: ProfileCompletionFieldDef[];
}

export const PROFILE_COMPLETION_SECTIONS: ProfileCompletionSectionConfig[] = [
  {
    id: 'basic',
    label: 'Basic',
    weight: 18,
    required: [
      { key: 'firstName', label: 'First name' },
      { key: 'lastName', label: 'Last name' },
      { key: 'displayPictureUrl', label: 'Display picture' },
      { key: 'dateOfBirth', label: 'Date of birth' },
      { key: 'gender', label: 'Gender' },
      { key: 'phoneNumber', label: 'Phone number' },
      { key: 'nationality', label: 'Nationality' },
      { key: 'personalEmail', label: 'Personal email' },
    ],
    optional: [
      { key: 'preferredName', label: 'Preferred name' },
      { key: 'secondaryPhoneNumber', label: 'Secondary phone' },
      { key: 'maritalStatus', label: 'Marital status' },
    ],
  },
  {
    id: 'address',
    label: 'Address',
    weight: 16,
    required: [
      { key: 'addressType', label: 'Address type' },
      { key: 'state', label: 'State' },
      { key: 'city', label: 'City' },
      { key: 'fullAddress', label: 'Full address' },
      { key: 'country', label: 'Country' },
      { key: 'addressProofType', label: 'Address proof type' },
      { key: 'addressProofUrl', label: 'Address proof document' },
    ],
    optional: [
      { key: 'closestLandmark', label: 'Closest landmark' },
      { key: 'postalCode', label: 'Postal code' },
    ],
  },
  {
    id: 'bank',
    label: 'Bank',
    weight: 12,
    required: [
      { key: 'bankName', label: 'Bank name' },
      { key: 'accountName', label: 'Account name' },
      { key: 'accountNumber', label: 'Account number' },
    ],
    optional: [],
  },
  {
    id: 'medical',
    label: 'Medical',
    weight: 10,
    required: [{ key: 'bloodGroup', label: 'Blood group' }],
    optional: [
      { key: 'knownMedicalConditions', label: 'Known medical conditions' },
      { key: 'allergies', label: 'Allergies' },
    ],
  },
  {
    id: 'emergency',
    label: 'Emergency',
    weight: 14,
    required: [
      { key: 'fullName', label: 'Full name' },
      { key: 'relationship', label: 'Relationship' },
      { key: 'phoneNumber', label: 'Phone number' },
      { key: 'fullAddress', label: 'Full address' },
      { key: 'state', label: 'State' },
      { key: 'city', label: 'City' },
      { key: 'country', label: 'Country' },
    ],
    optional: [
      { key: 'email', label: 'Email' },
      { key: 'closestLandmark', label: 'Closest landmark' },
      { key: 'postalCode', label: 'Postal code' },
    ],
  },
  {
    id: 'next-of-kin',
    label: 'Next of kin',
    weight: 14,
    required: [
      { key: 'fullName', label: 'Full name' },
      { key: 'relationship', label: 'Relationship' },
      { key: 'phoneNumber', label: 'Phone number' },
      { key: 'fullAddress', label: 'Full address' },
      { key: 'state', label: 'State' },
      { key: 'city', label: 'City' },
      { key: 'country', label: 'Country' },
    ],
    optional: [
      { key: 'email', label: 'Email' },
      { key: 'closestLandmark', label: 'Closest landmark' },
      { key: 'postalCode', label: 'Postal code' },
    ],
  },
  {
    id: 'employment',
    label: 'Employment',
    weight: 10,
    required: [
      { key: 'jobTitle', label: 'Job title' },
      { key: 'employmentType', label: 'Employment type' },
      { key: 'dateOfJoining', label: 'Date of joining' },
      { key: 'workLocation', label: 'Work location' },
    ],
    optional: [],
  },
  {
    id: 'personal',
    label: 'Personal',
    weight: 6,
    required: [{ key: 'supportNeeded', label: 'Support needed' }],
    optional: [
      { key: 'funFact', label: 'Fun fact' },
      { key: 'hobbies', label: 'Hobbies or interests' },
    ],
  },
];

export const PROFILE_COMPLETION_TOTAL_SECTIONS =
  PROFILE_COMPLETION_SECTIONS.length;
