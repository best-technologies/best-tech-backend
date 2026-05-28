export type ProfileCompletionSectionId =
  | 'basic'
  | 'address'
  | 'bank'
  | 'medical'
  | 'emergency'
  | 'next-of-kin'
  | 'employment'
  | 'personal';

export interface ProfileCompletionSection {
  id: ProfileCompletionSectionId;
  label: string;
  weight: number;
  percent: number;
  requiredCompleted: number;
  requiredTotal: number;
  optionalCompleted: number;
  optionalTotal: number;
  missingRequired: string[];
  missingOptional: string[];
}

export interface ProfileCompletionData {
  overallPercent: number;
  completedSections: number;
  totalSections: number;
  sections: ProfileCompletionSection[];
}
