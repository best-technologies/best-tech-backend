import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { Request, Response } from 'express';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from 'src/identity/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateCategoryDto } from './dto/create-category-dto';
import { CreateSubcategoryDto } from './dto/create-sub-category';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @ApiOperation({ summary: 'Get all categories with their subcategories' })
  @ApiResponse({
    status: 200,
    description: 'Categories and subcategories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Categories and subcategories fetched successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clx1234567890' },
              categoryName: { type: 'string', example: 'Web Development' },
              subcategories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'clx1234567891' },
                    subcategoryName: {
                      type: 'string',
                      example: 'Frontend Development',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @Get()
  async getAllCategoriesWithSubcategories(@Res() res: Response) {
    const result =
      await this.servicesService.getAllCategoriesWithSubcategories();
    return res.status(result.statusCode).json(result);
  }

  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Category with supplied name already exists',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/create-category')
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const result = await this.servicesService.createCategory(dto, req.user);
    return res.status(result.statusCode).json(result);
  }

  @ApiOperation({ summary: 'Create a new subcategory (Admin only)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: 'Subcategory created successfully' })
  @ApiResponse({ status: 400, description: 'Selected category does not exist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Subcategory with supplied name already exists',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/create-subcategory')
  async createSubcategory(
    @Body() dto: CreateSubcategoryDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const result = await this.servicesService.createSubcategory(dto, req.user);
    return res.status(result.statusCode).json(result);
  }

  @ApiOperation({ summary: 'Create a new service (Admin only)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Service with supplied name already exists',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/create')
  async createService(
    @Body() dto: CreateServiceDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const result = await this.servicesService.createService(dto, req.user);
    return res.status(result.statusCode).json(result);
  }
}
