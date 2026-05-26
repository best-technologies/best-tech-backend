import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import * as colors from 'colors';
import { failureResponse, successResponse } from 'src/utils/response';
import { CreateCategoryDto } from './dto/create-category-dto';
import { CreateSubcategoryDto } from './dto/create-sub-category';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // /////////////////////                           Create a new category
  async createCategory(dto: CreateCategoryDto, user: any) {
    console.log(colors.green('Creating new category...'));

    try {
      const existingCategory = await this.prisma.category.findFirst({
        where: { categoryName: dto.categoryName },
      });
      if (existingCategory) {
        console.log(colors.red('Category with supplied name already exists'));
        return successResponse(
          409,
          false,
          'Category with supplied name already exists',
        );
      }

      const newCategory = await this.prisma.category.create({
        data: {
          ...dto,
          userId: user.userId,
          creatorEmail: user.email,
        },
      });

      console.log(colors.magenta('New category created successfully'));
      return successResponse(201, true, 'New category created successfully');
    } catch (error) {
      console.log(colors.red(`Error creating category: ${error}`));
      return failureResponse(500, 'Internal server error', false);
    }
  }

  // /////////////////////                           create new subcategory
  async createSubcategory(dto: CreateSubcategoryDto, user: any) {
    console.log(colors.green('Creating new subcategory...'));

    try {
      // console.log("categoryId", dto.categoryId);
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        const allCategories = await this.prisma.category.findMany({
          select: {
            categoryName: true,
            id: true,
          },
        });

        console.log(colors.red('Invalid category selected — not found in DB'));

        return {
          statusCode: 400,
          message:
            'Selected category does not exist. See available categories below.',
          success: false,
          data: allCategories, // I will Include available categories in response
        };
      }

      const existingCategory = await this.prisma.subcategory.findFirst({
        where: { subcategoryName: dto.subcategoryName },
      });
      if (existingCategory) {
        console.log(
          colors.red('Subcategory with supplied name already exists'),
        );
        return successResponse(
          409,
          false,
          'Subcategory with supplied name already exists',
        );
      }

      const subcategory = await this.prisma.subcategory.create({
        data: {
          subcategoryName: dto.subcategoryName,
          categoryId: dto.categoryId,
          userId: user.userId,
          creatorEmail: user.email,
        },
      });

      const formattedSubcategory = {
        id: subcategory.id,
        subCategoryName: subcategory.subcategoryName,
        categoryId: subcategory.categoryId,
        userId: subcategory.userId,
        creatorEmail: subcategory.creatorEmail,
        createdAt: subcategory.createdAt,
        updatedAt: subcategory.updatedAt,
      };

      console.log(colors.magenta('Subcategory created successfully'));
      return successResponse(
        201,
        true,
        'Subcategory created successfully',
        undefined,
        formattedSubcategory,
      );
    } catch (error) {
      console.log(colors.red(`Error creating subcategory: ${error.message}`));
      return failureResponse(500, 'Internal server error', false);
    }
  }

  // /////////////////////                           Create a new service
  async createService(dto: CreateServiceDto, user: any) {
    console.log(colors.green('Creating new service...'));

    try {
      // Check if service already exists
      const existingService = await this.prisma.service.findFirst({
        where: { title: dto.title },
      });
      if (existingService) {
        console.log(colors.red('Service with supplied name already exists'));
        return {
          statusCode: 409,
          message: 'Service with supplied name already exists',
          success: false,
        };
      }

      // Create new service
      const newService = await this.prisma.service.create({
        data: {
          ...dto,
          userId: user.userId, // from validated jwt
          createdById: user.userId,
          creatorEmail: user.email,
        },
      });

      console.log(colors.magenta('New service created successfully'));
      return successResponse(201, true, 'New service created successfully');
    } catch (error) {
      console.log(colors.red(`Error creating service:, ${error}`));
      return failureResponse(500, 'Internal server error', false);
    }
  }

  // /////////////////////                           Get all categories with subcategories
  async getAllCategoriesWithSubcategories() {
    try {
      const categories = await this.prisma.category.findMany({
        select: {
          id: true,
          categoryName: true,
          subcategories: {
            select: {
              id: true,
              subcategoryName: true,
            },
          },
        },
      });

      const result = categories.map((category) => ({
        id: category.id,
        categoryName: category.categoryName,
        subcategories: category.subcategories,
      }));

      return successResponse(
        200,
        true,
        'Categories and subcategories fetched successfully',
        undefined,
        result,
      );
    } catch (error) {
      console.error(
        colors.red(
          `Error fetching categories with subcategories: ${error.message}`,
        ),
      );
      return failureResponse(500, 'Internal server error', false);
    }
  }

  // /////////////////////                          create a new course
  async createCourse() {
    console.log(colors.green('Creating new course...'));

    try {
      // Check if course already exists
      // const existingCourse = await this.serviceModel.findOne({ name: dto.title }).exec();

      // if (existingCourse) {
      //     console.log(colors.red('Course with supplied name already exists'));
      //     return { statusCode: 409, message: 'Course with supplied name already exists', success: false };
      // }

      console.log(colors.magenta('New course created successfully'));
      return successResponse(201, true, 'New course created successfully');
    } catch (error) {
      console.error(colors.red(`Error creating course: ${error.message}`));
      return failureResponse(500, 'Internal server error', false);
    }
  }
}
