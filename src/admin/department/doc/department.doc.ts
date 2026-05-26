import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  DepartmentCreateResponseDto,
  DepartmentDataDto,
  DepartmentDeleteResponseDto,
  DepartmentFailureResponseDto,
  DepartmentListResponseDto,
  DepartmentSingleResponseDto,
} from './department-response.dto';

export const DepartmentControllerDocs = () =>
  applyDecorators(
    ApiTags('Admin - Departments'),
    ApiBearerAuth('JWT-auth'),
    ApiExtraModels(
      DepartmentDataDto,
      DepartmentCreateResponseDto,
      DepartmentListResponseDto,
      DepartmentSingleResponseDto,
      DepartmentDeleteResponseDto,
      DepartmentFailureResponseDto,
    ),
  );

export const CreateDepartmentDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a department (Admin only)' }),
    ApiCreatedResponse({
      description: 'Department created successfully',
      type: DepartmentCreateResponseDto,
    }),
    ApiConflictResponse({
      description: 'Department name already exists',
      type: DepartmentFailureResponseDto,
    }),
  );

export const FindAllDepartmentsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all departments (Admin only)' }),
    ApiOkResponse({
      description: 'Departments fetched successfully',
      type: DepartmentListResponseDto,
    }),
  );

export const FindOneDepartmentDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a department by ID (Admin only)' }),
    ApiOkResponse({
      description: 'Department fetched successfully',
      type: DepartmentSingleResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Department not found',
      type: DepartmentFailureResponseDto,
    }),
  );

export const UpdateDepartmentDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a department (Admin only)' }),
    ApiOkResponse({
      description: 'Department updated successfully',
      type: DepartmentSingleResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Department not found',
      type: DepartmentFailureResponseDto,
    }),
    ApiConflictResponse({
      description: 'Department name already exists',
      type: DepartmentFailureResponseDto,
    }),
  );

export const DeleteDepartmentDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a department (Admin only)' }),
    ApiOkResponse({
      description: 'Department deleted successfully',
      type: DepartmentDeleteResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Department not found',
      type: DepartmentFailureResponseDto,
    }),
  );
