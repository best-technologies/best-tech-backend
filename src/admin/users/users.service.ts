import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, type Role, type UserType } from '../../prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from '../../common/logger/logger.service';
import { StorageService } from '../../common/storage/storage.service';
import { formatDate } from '../../common/helper-functions/formatter';
import {
  ApiResponse,
  successResponse,
  failureResponse,
} from '../../utils/response';
import { CreateAdminUserDto } from './dto/create-user.dto';
import { UpdateAdminUserDto } from './dto/update-user.dto';
import { QueryUsersDashboardDto } from './dto/query-users-dashboard.dto';
import type {
  UserData,
  UsersDashboardPayload,
  UsersAnalytics,
  UserDepartmentCount,
} from './types/user.types';
import * as colors from 'colors';

const SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'firstName',
  'lastName',
  'email',
  'role',
  'userType',
] as const;

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly storageService: StorageService,
  ) {}

  private getErrorTrace(error: unknown): string | undefined {
    return error instanceof Error ? error.stack : String(error);
  }

  private formatUser(
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: Role;
      userType: UserType;
      isActive: boolean;
      displayPictureUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
      department: { id: string; name: string } | null;
    },
  ): UserData {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      userType: user.userType,
      isActive: user.isActive,
      department: user.department
        ? { id: user.department.id, name: user.department.name }
        : null,
      displayPictureUrl: user.displayPictureUrl,
      createdAt: formatDate(user.createdAt),
      updatedAt: formatDate(user.updatedAt),
    };
  }

  private getUserInclude() {
    return {
      department: { select: { id: true, name: true } },
    };
  }

  private buildWhere(
    query: QueryUsersDashboardDto,
  ): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.userType) {
      where.userType = query.userType;
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return where;
  }

  private emptyByUserType(): Record<UserType, number> {
    return {
      STAFF: 0,
      CORPORATE: 0,
      INTERN: 0,
      IT: 0,
      STUDENT: 0,
      OTHER: 0,
    };
  }

  private async buildAnalytics(
    where: Prisma.UserWhereInput,
  ): Promise<UsersAnalytics> {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleGroups,
      userTypeGroups,
      deptGroups,
    ] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.count({ where: { ...where, isActive: true } }),
      this.prisma.user.count({ where: { ...where, isActive: false } }),
      this.prisma.user.groupBy({
        by: ['role'],
        where,
        _count: { id: true },
      }),
      this.prisma.user.groupBy({
        by: ['userType'],
        where,
        _count: { id: true },
      }),
      this.prisma.user.groupBy({
        by: ['departmentId'],
        where: { ...where, departmentId: { not: null } },
        _count: { id: true },
      }),
    ]);

    const byRole = { admin: 0, staff: 0, user: 0 };
    for (const row of roleGroups) {
      if (row.role === 'admin') byRole.admin = row._count.id;
      if (row.role === 'staff') byRole.staff = row._count.id;
      if (row.role === 'user') byRole.user = row._count.id;
    }

    const byUserType = this.emptyByUserType();
    for (const row of userTypeGroups) {
      byUserType[row.userType] = row._count.id;
    }

    const sortedDepts = [...deptGroups]
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 10);
    const ids = sortedDepts
      .map((d) => d.departmentId)
      .filter((id): id is string => id != null);

    let topDepartments: UserDepartmentCount[] = [];

    if (ids.length > 0) {
      const departments = await this.prisma.department.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true },
      });
      const nameMap = new Map(departments.map((d) => [d.id, d.name]));
      topDepartments = sortedDepts
        .map((row) => {
          const deptId = row.departmentId;
          if (!deptId) return null;
          return {
            departmentId: deptId,
            name: nameMap.get(deptId) ?? 'Unknown',
            count: row._count.id,
          };
        })
        .filter((x): x is UserDepartmentCount => x !== null);
    }

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      byRole,
      byUserType,
      topDepartments,
    };
  }

  async getDashboard(
    query: QueryUsersDashboardDto,
  ): Promise<ApiResponse<UsersDashboardPayload>> {
    this.logger.log(
      colors.green('Fetching admin users dashboard...'),
      'AdminUsersService',
    );

    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const sortOrder = query.sortOrder ?? 'desc';
      const rawSortBy = query.sortBy ?? 'createdAt';
      const sortBy = SORT_FIELDS.includes(rawSortBy as (typeof SORT_FIELDS)[number])
        ? rawSortBy
        : 'createdAt';

      const skip = (page - 1) * limit;

      const where = this.buildWhere(query);

      const orderBy = {
        [sortBy]: sortOrder,
      } as Prisma.UserOrderByWithRelationInput;

      const [totalCount, users, analytics] = await Promise.all([
        this.prisma.user.count({ where }),
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: this.getUserInclude(),
        }),
        this.buildAnalytics(where),
      ]);

      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      const payload: UsersDashboardPayload = {
        analytics,
        users: users.map((u) => this.formatUser(u)),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };

      return successResponse(
        200,
        true,
        'Users dashboard fetched successfully',
        payload.users.length,
        payload,
      );
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching users dashboard',
        this.getErrorTrace(error),
        'AdminUsersService',
      );
      return failureResponse(500, 'Failed to fetch users dashboard', false);
    }
  }

  async findOne(id: string): Promise<ApiResponse<UserData>> {
    this.logger.log(
      colors.green(`Fetching user ${id}...`),
      'AdminUsersService',
    );

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: this.getUserInclude(),
      });

      if (!user) {
        return failureResponse(404, 'User not found', false);
      }

      return successResponse(
        200,
        true,
        'User fetched successfully',
        1,
        this.formatUser(user),
      );
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching user',
        this.getErrorTrace(error),
        'AdminUsersService',
      );
      return failureResponse(500, 'Failed to fetch user', false);
    }
  }

  async create(
    dto: CreateAdminUserDto,
  ): Promise<ApiResponse<UserData>> {
    this.logger.log(colors.green('Creating user (admin)...'), 'AdminUsersService');

    try {
      const email = dto.email.trim().toLowerCase();

      const existing = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existing) {
        return failureResponse(409, 'User with this email already exists', false);
      }

      if (dto.departmentId) {
        const dept = await this.prisma.department.findUnique({
          where: { id: dto.departmentId },
        });
        if (!dept) {
          return failureResponse(404, 'Department not found', false);
        }
      }

      const hashed = await bcrypt.hash(dto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email,
          password: hashed,
          role: dto.role ?? 'user',
          userType: dto.userType ?? 'STAFF',
          isActive: dto.isActive ?? true,
          departmentId: dto.departmentId ?? null,
          displayPictureUrl: dto.displayPictureUrl ?? null,
          displayPictureKey: dto.displayPictureKey ?? null,
        },
        include: this.getUserInclude(),
      });

      return successResponse(
        201,
        true,
        'User created successfully',
        1,
        this.formatUser(user),
      );
    } catch (error: unknown) {
      this.logger.error(
        'Error creating user',
        this.getErrorTrace(error),
        'AdminUsersService',
      );
      return failureResponse(500, 'Failed to create user', false);
    }
  }

  async update(
    id: string,
    dto: UpdateAdminUserDto,
  ): Promise<ApiResponse<UserData>> {
    this.logger.log(
      colors.green(`Updating user ${id}...`),
      'AdminUsersService',
    );

    try {
      const existing = await this.prisma.user.findUnique({ where: { id } });
      if (!existing) {
        return failureResponse(404, 'User not found', false);
      }

      if (dto.email !== undefined) {
        const email = dto.email.trim().toLowerCase();
        const other = await this.prisma.user.findFirst({
          where: { email, NOT: { id } },
        });
        if (other) {
          return failureResponse(
            409,
            'Another user already uses this email',
            false,
          );
        }
      }

      const data: Prisma.UserUpdateInput = {};

      if (dto.firstName !== undefined) data.firstName = dto.firstName.trim();
      if (dto.lastName !== undefined) data.lastName = dto.lastName.trim();
      if (dto.email !== undefined)
        data.email = dto.email.trim().toLowerCase();
      if (dto.role !== undefined) data.role = dto.role;
      if (dto.userType !== undefined) data.userType = dto.userType;
      if (dto.isActive !== undefined) data.isActive = dto.isActive;

      if (dto.password && dto.password.length > 0) {
        data.password = await bcrypt.hash(dto.password, 10);
      }

      if (dto.departmentId !== undefined) {
        if (dto.departmentId === null || dto.departmentId === '') {
          data.department = { disconnect: true };
        } else {
          const dept = await this.prisma.department.findUnique({
            where: { id: dto.departmentId },
          });
          if (!dept) {
            return failureResponse(404, 'Department not found', false);
          }
          data.department = { connect: { id: dto.departmentId } };
        }
      }

      if (dto.clearDisplayPicture) {
        data.displayPictureUrl = null;
        data.displayPictureKey = null;
        if (existing.displayPictureKey) {
          try {
            await this.storageService.deleteImage(existing.displayPictureKey);
          } catch (_) {
            this.logger.warn(
              colors.yellow(
                `Could not delete avatar object: ${existing.displayPictureKey}`,
              ),
              'AdminUsersService',
            );
          }
        }
      } else {
        const pictureKeyChanging =
          dto.displayPictureKey !== undefined &&
          dto.displayPictureKey !== existing.displayPictureKey;

        if (pictureKeyChanging && existing.displayPictureKey) {
          try {
            await this.storageService.deleteImage(existing.displayPictureKey);
          } catch (_) {
            this.logger.warn(
              colors.yellow(
                `Could not delete old avatar object: ${existing.displayPictureKey}`,
              ),
              'AdminUsersService',
            );
          }
        }

        if (dto.displayPictureUrl !== undefined) {
          data.displayPictureUrl = dto.displayPictureUrl ?? null;
        }
        if (dto.displayPictureKey !== undefined) {
          data.displayPictureKey = dto.displayPictureKey ?? null;
        }
      }

      const user = await this.prisma.user.update({
        where: { id },
        data,
        include: this.getUserInclude(),
      });

      return successResponse(
        200,
        true,
        'User updated successfully',
        1,
        this.formatUser(user),
      );
    } catch (error: unknown) {
      this.logger.error(
        'Error updating user',
        this.getErrorTrace(error),
        'AdminUsersService',
      );
      return failureResponse(500, 'Failed to update user', false);
    }
  }

  async deactivate(id: string): Promise<ApiResponse<UserData>> {
    this.logger.log(
      colors.green(`Deactivating user ${id}...`),
      'AdminUsersService',
    );

    try {
      const existing = await this.prisma.user.findUnique({ where: { id } });
      if (!existing) {
        return failureResponse(404, 'User not found', false);
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: { isActive: false, refreshToken: null },
        include: this.getUserInclude(),
      });

      return successResponse(
        200,
        true,
        'User deactivated successfully',
        1,
        this.formatUser(user),
      );
    } catch (error: unknown) {
      this.logger.error(
        'Error deactivating user',
        this.getErrorTrace(error),
        'AdminUsersService',
      );
      return failureResponse(500, 'Failed to deactivate user', false);
    }
  }
}
