export interface UserProfileDepartment {
  id: string;
  name: string;
}

export interface UserProfileBasicDetails {
  firstName: string;
  lastName: string;
  preferredName: string | null;
  email: string;
  officialEmail: string;
  personalEmail: string | null;
  password: string;
  dateOfBirth: string | null;
  gender: string | null;
  phoneNumber: string | null;
  secondaryPhoneNumber: string | null;
  maritalStatus: string | null;
  nationality: string | null;
}

export interface UserProfileAddress {
  id: string;
  addressType: string;
  state: string | null;
  city: string | null;
  closestLandmark: string | null;
  fullAddress: string | null;
  postalCode: string | null;
  country: string | null;
  addressProofType: string | null;
  addressProofUrl: string | null;
  isPrimary: boolean;
}

export interface UserProfileBankAccount {
  id: string;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  isPrimary: boolean;
}

export interface UserProfileMedicalDetails {
  bloodGroup: string | null;
  knownMedicalConditions: string[];
  allergies: string[];
}

export interface UserProfileContactAddress {
  id: string;
  fullName: string | null;
  relationship: string | null;
  phoneNumber: string | null;
  email: string | null;
  state: string | null;
  city: string | null;
  closestLandmark: string | null;
  fullAddress: string | null;
  postalCode: string | null;
  country: string | null;
  isPrimary: boolean;
}

export interface UserProfileEmployment {
  id: string;
  jobTitle: string | null;
  department: UserProfileDepartment | null;
  employmentType: string | null;
  dateOfJoining: string | null;
  workLocation: string | null;
  isPrimary: boolean;
}

export interface UserProfilePersonalDetails {
  funFact: string | null;
  hobbies: string[];
  supportNeeded: string | null;
}

export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  userType: string;
  isActive: boolean;
  department: UserProfileDepartment | null;
  displayPictureUrl: string | null;
  ninImageUrl: string | null;
  nyscCertificateUrl: string | null;
  staffId: string | null;
  createdAt: string;
  updatedAt: string;
  basicDetails: UserProfileBasicDetails;
  addresses: UserProfileAddress[];
  bankAccounts: UserProfileBankAccount[];
  medicalDetails: UserProfileMedicalDetails;
  emergencyContacts: UserProfileContactAddress[];
  nextOfKin: UserProfileContactAddress[];
  employments: UserProfileEmployment[];
  personalDetails: UserProfilePersonalDetails;
}
