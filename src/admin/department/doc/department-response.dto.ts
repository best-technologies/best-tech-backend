import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepartmentDataDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'Engineering' })
  name: string;

  @ApiProperty({
    nullable: true,
    example: 'Software development and infrastructure',
  })
  description: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 12 })
  totalUsers: number;

  @ApiProperty({ example: 10 })
  activeUsers: number;

  @ApiProperty({ example: 2 })
  inactiveUsers: number;

  @ApiProperty({ example: '26 May 2026' })
  createdAt: string;

  @ApiProperty({ example: '26 May 2026' })
  updatedAt: string;
}

export class DepartmentFailureResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Department not found' })
  message: string;

  @ApiProperty({ nullable: true, example: null })
  error: unknown;
}

export class DepartmentCreateResponseDto {
  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Department created successfully' })
  message: string;

  @ApiProperty({ example: 1 })
  length: number;

  @ApiProperty({ type: DepartmentDataDto })
  data: DepartmentDataDto;
}

export class DepartmentListResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Departments fetched successfully' })
  message: string;

  @ApiProperty({ example: 2 })
  length: number;

  @ApiProperty({ type: [DepartmentDataDto] })
  data: DepartmentDataDto[];
}

export class DepartmentSingleResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Department fetched successfully' })
  message: string;

  @ApiProperty({ example: 1 })
  length: number;

  @ApiProperty({ type: DepartmentDataDto })
  data: DepartmentDataDto;
}

export class DepartmentDeleteResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Department deleted successfully' })
  message: string;

  @ApiPropertyOptional({ example: undefined })
  length?: number;

  @ApiPropertyOptional({ example: undefined })
  data?: unknown;
}
