import type { Prisma } from '../../prisma/client';
import { USER_PROFILE_INCLUDE } from './profile-formatter';
import { calculateProfileCompletion } from './profile-completion.helper';

type ProfileRecord = Prisma.UserGetPayload<{
  include: typeof USER_PROFILE_INCLUDE;
}>;

function createEmptyUser(): ProfileRecord {
  return {
    id: 'user-1',
    firstName: '',
    lastName: '',
    email: 'user@example.com',
    password: 'hashed',
    role: 'user',
    userType: 'STAFF',
    isActive: true,
    displayPictureUrl: null,
    displayPictureKey: null,
    departmentId: null,
    refreshToken: null,
    otp: null,
    otpExpires: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    department: null,
    profile: {
      id: 'profile-1',
      userId: 'user-1',
      dateOfBirth: null,
      gender: null,
      personalEmail: null,
      phoneNumber: null,
      secondaryPhoneNumber: null,
      maritalStatus: null,
      preferredName: null,
      nationality: null,
      bloodGroup: null,
      knownMedicalConditions: [],
      allergies: [],
      funFact: null,
      hobbies: [],
      supportNeeded: null,
      staffId: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      addresses: [],
      bankAccounts: [],
      emergencyContacts: [],
      nextOfKin: [],
      employments: [],
    },
  } as ProfileRecord;
}

describe('calculateProfileCompletion', () => {
  it('returns 0% overall for an empty profile', () => {
    const result = calculateProfileCompletion(createEmptyUser());

    expect(result.overallPercent).toBe(0);
    expect(result.completedSections).toBe(0);
    expect(result.totalSections).toBe(8);
    expect(result.sections.every((section) => section.percent === 0)).toBe(
      true,
    );
  });

  it('increases basic and overall percent when display picture is added', () => {
    const user = createEmptyUser();
    user.displayPictureUrl = 'https://example.com/avatar.jpg';

    const result = calculateProfileCompletion(user);
    const basic = result.sections.find((section) => section.id === 'basic');

    expect(basic?.requiredCompleted).toBe(1);
    expect(basic?.percent).toBe(13);
    expect(result.overallPercent).toBe(2);
  });

  it('marks a section complete when all required fields are filled', () => {
    const user = createEmptyUser();
    user.profile!.bloodGroup = 'O+';
    user.profile!.knownMedicalConditions = ['Asthma'];
    user.profile!.allergies = ['Peanuts'];

    const result = calculateProfileCompletion(user);
    const medical = result.sections.find((section) => section.id === 'medical');

    expect(medical?.percent).toBe(100);
    expect(medical?.requiredCompleted).toBe(1);
    expect(medical?.optionalCompleted).toBe(2);
    expect(result.completedSections).toBe(1);
    expect(result.overallPercent).toBe(10);
  });

  it('returns 0% for collection sections with no records', () => {
    const user = createEmptyUser();

    const result = calculateProfileCompletion(user);
    const address = result.sections.find((section) => section.id === 'address');
    const bank = result.sections.find((section) => section.id === 'bank');

    expect(address?.percent).toBe(0);
    expect(address?.missingRequired).toContain('Full address');
    expect(bank?.percent).toBe(0);
  });

  it('scores collection sections from the primary record', () => {
    const user = createEmptyUser();
    user.profile!.bankAccounts = [
      {
        id: 'bank-1',
        userProfileId: 'profile-1',
        bankName: 'First Bank',
        accountName: 'Jane Doe',
        accountNumber: '1234567890',
        isPrimary: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    const result = calculateProfileCompletion(user);
    const bank = result.sections.find((section) => section.id === 'bank');

    expect(bank?.percent).toBe(100);
    expect(result.overallPercent).toBe(12);
  });

  it('tracks optional fields without blocking section completion', () => {
    const user = createEmptyUser();
    user.profile!.supportNeeded = 'Quiet workspace';
    user.profile!.funFact = 'I love hiking';

    const result = calculateProfileCompletion(user);
    const personal = result.sections.find(
      (section) => section.id === 'personal',
    );

    expect(personal?.percent).toBe(100);
    expect(personal?.optionalCompleted).toBe(1);
    expect(personal?.missingOptional).toContain('Hobbies or interests');
  });
});
