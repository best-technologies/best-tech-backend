import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { QueryContactUsDto } from './dto/query-contact-us.dto';
import { RolesGuard } from '../common/guards/roles.guards';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from 'express';

@ApiTags('Contact Us')
@Controller('admin/contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact us entry' })
  @ApiResponse({
    status: 201,
    description: 'Contact us entry created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createContactUsDto: CreateContactUsDto,
    @Res() res: Response,
  ) {
    const result = await this.contactUsService.create(createContactUsDto);
    return res.status(result.statusCode).json(result);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Get all contact us entries with filtering and pagination (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of contact us entries with pagination',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'subject',
    required: false,
    description: 'Filter by subject',
  })
  @ApiQuery({
    name: 'proposedBudget',
    required: false,
    description: 'Filter by budget',
  })
  @ApiQuery({
    name: 'projectTimeline',
    required: false,
    description: 'Filter by timeline',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in name, email, company, or details',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field (default: createdAt)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order: asc or desc (default: desc)',
  })
  async findAll(@Query() queryDto: QueryContactUsDto, @Res() res: Response) {
    const result = await this.contactUsService.findAll(queryDto);
    return res.status(result.statusCode).json(result);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get contact us statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Contact us statistics retrieved successfully',
  })
  async getStats(@Res() res: Response) {
    const result = await this.contactUsService.getContactUsStats();
    return res.status(result.statusCode).json(result);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Search contact us entries (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async search(@Query('q') query: string, @Res() res: Response) {
    const result = await this.contactUsService.searchContactUs(query);
    return res.status(result.statusCode).json(result);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get a specific contact us entry by ID (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Contact us entry found' })
  @ApiResponse({ status: 404, description: 'Contact us entry not found' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const result = await this.contactUsService.findOne(id);
    return res.status(result.statusCode).json(result);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Update a contact us entry - only passed fields will be updated (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact us entry updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Contact us entry not found' })
  async update(
    @Param('id') id: string,
    @Body() updateContactUsDto: UpdateContactUsDto,
    @Res() res: Response,
  ) {
    const result = await this.contactUsService.update(id, updateContactUsDto);
    return res.status(result.statusCode).json(result);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a contact us entry (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Contact us entry deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Contact us entry not found' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    const result = await this.contactUsService.remove(id);
    return res.status(result.statusCode).json(result);
  }
}
