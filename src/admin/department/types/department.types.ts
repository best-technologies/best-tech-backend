export interface DepartmentData {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  createdAt: string;
  updatedAt: string;
}
