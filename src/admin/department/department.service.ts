import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from '../../common/logger/logger.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import {
  ApiResponse,
  successResponse,
  failureResponse,
} from '../../utils/response';
import { formatDate } from '../../common/helper-functions/formatter';
import { DepartmentData } from './types/department.types';
import * as colors from 'colors';

@Injectable()
export class DepartmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  private formatDepartment(department: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): DepartmentData {
    return {
      id: department.id,
      name: department.name,
      description: department.description,
      isActive: department.isActive,
      createdAt: formatDate(department.createdAt),
      updatedAt: formatDate(department.updatedAt),
    };
  }

  private getErrorTrace(error: unknown): string | undefined {
    return error instanceof Error ? error.stack : String(error);
  }

  async create(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<ApiResponse<DepartmentData>> {
    this.logger.log(
      colors.green('Creating department...'),
      'DepartmentService',
    );

    try {
      const existingDepartment = await this.prisma.department.findUnique({
        where: { name: createDepartmentDto.name },
      });

      if (existingDepartment) {
        return failureResponse(
          409,
          'Department with this name already exists',
          false,
        );
      }

      const department = await this.prisma.department.create({
        data: {
          name: createDepartmentDto.name,
          description: createDepartmentDto.description,
          isActive: createDepartmentDto.isActive ?? true,
        },
      });

      return successResponse(
        201,
        true,
        'Department created successfully',
        1,
        this.formatDepartment(department),
      );
    } catch (error: unknown) {
      this.logger.error(
        'Error creating department',
        this.getErrorTrace(error),
        'DepartmentService',
      );
      return failureResponse(500, 'Failed to create department', false);
    }
  }

  async findAll(): Promise<ApiResponse<DepartmentData[]>> {
    this.logger.log(
      colors.green('Fetching departments...'),
      'DepartmentService',
    );

    try {
      const departments = await this.prisma.department.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const formattedData = departments.map((department) =>
        this.formatDepartment(department),
      );

      return successResponse(
        200,
        true,
        'Departments fetched successfully',
        departments.length,
        formattedData,
      );
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching departments',
        this.getErrorTrace(error),
        'DepartmentService',
      );
      return failureResponse(500, 'Failed to fetch departments', false);
    }
  }

  async findOne(id: string): Promise<ApiResponse<DepartmentData>> {
    this.logger.log(
      colors.green(`Fetching department ${id}...`),
      'DepartmentService',
    );

    try {
      const department = await this.prisma.department.findUnique({
        where: { id },
      });

      if (!department) {
        return failureResponse(404, 'Department not found', false);
      }

      return successResponse(
        200,
        true,
        'Department fetched successfully',
        1,
        this.formatDepartment(department),
      );
    } catch (error: unknown) {
      this.logger.error(
        'Error fetching department',
        this.getErrorTrace(error),
        'DepartmentService',
      );
      return failureResponse(500, 'Failed to fetch department', false);
    }
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<ApiResponse<DepartmentData>> {
    this.logger.log(
      colors.green(`Updating department ${id}...`),
      'DepartmentService',
    );

    try {
      const existingDepartment = await this.prisma.department.findUnique({
        where: { id },
      });

      if (!existingDepartment) {
        return failureResponse(404, 'Department not found', false);
      }

      if (
        updateDepartmentDto.name &&
        updateDepartmentDto.name !== existingDepartment.name
      ) {
        const duplicateName = await this.prisma.department.findUnique({
          where: { name: updateDepartmentDto.name },
        });

        if (duplicateName) {
          return failureResponse(
            409,
            'Department with this name already exists',
            false,
          );
        }
      }

      const department = await this.prisma.department.update({
        where: { id },
        data: updateDepartmentDto,
      });

      return successResponse(
        200,
        true,
        'Department updated successfully',
        1,
        this.formatDepartment(department),
      );
    } catch (error: unknown) {
      this.logger.error(
        'Error updating department',
        this.getErrorTrace(error),
        'DepartmentService',
      );
      return failureResponse(500, 'Failed to update department', false);
    }
  }

  async remove(id: string): Promise<ApiResponse<never>> {
    this.logger.log(
      colors.green(`Deleting department ${id}...`),
      'DepartmentService',
    );

    try {
      const existingDepartment = await this.prisma.department.findUnique({
        where: { id },
      });

      if (!existingDepartment) {
        return failureResponse(404, 'Department not found', false);
      }

      await this.prisma.department.delete({
        where: { id },
      });

      return successResponse(200, true, 'Department deleted successfully');
    } catch (error: unknown) {
      this.logger.error(
        'Error deleting department',
        this.getErrorTrace(error),
        'DepartmentService',
      );
      return failureResponse(500, 'Failed to delete department', false);
    }
  }
}
