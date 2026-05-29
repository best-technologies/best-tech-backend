import type { Role, UserType } from '../../../prisma/client';

export interface UserDepartmentPreview {
  id: string;
  name: string;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  userType: UserType;
  isActive: boolean;
  department: UserDepartmentPreview | null;
  displayPictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
  profileCompletionPercent?: number;
}

export interface UserRoleCounts {
  admin: number;
  staff: number;
  user: number;
}

export interface UserDepartmentCount {
  departmentId: string;
  name: string;
  count: number;
}

export interface UsersAnalytics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byRole: UserRoleCounts;
  byUserType: Record<UserType, number>;
  topDepartments: UserDepartmentCount[];
  profileCompletion: ProfileCompletionAnalytics;
}

export interface ProfileCompletionAnalytics {
  complete: number;
  inProgress: number;
  notStarted: number;
  averagePercent: number;
}

export interface UsersPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UsersDashboardPayload {
  analytics: UsersAnalytics;
  users: UserData[];
  pagination: UsersPagination;
}
