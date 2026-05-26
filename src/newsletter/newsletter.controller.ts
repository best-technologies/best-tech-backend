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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { QueryNewsletterDto } from './dto/query-newsletter.dto';
import { RolesGuard } from '../common/guards/roles.guards';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  NewsletterListResponseSchema,
  NewsletterSingleResponseSchema,
  NewsletterCreateResponseSchema,
} from './schemas/newsletter-response.schema';

@ApiTags('Newsletter - Admin')
@Controller('admin/newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Get all newsletter subscriptions with pagination and filtering (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of newsletter subscriptions with pagination',
    schema: NewsletterListResponseSchema,
  })
  findAll(@Query() queryDto: QueryNewsletterDto) {
    return this.newsletterService.findAll(queryDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get a specific newsletter subscription by ID (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Newsletter subscription found',
    schema: NewsletterSingleResponseSchema,
  })
  @ApiResponse({
    status: 404,
    description: 'Newsletter subscription not found',
  })
  findOne(@Param('id') id: string) {
    return this.newsletterService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a newsletter subscription (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Newsletter subscription updated successfully',
    schema: NewsletterSingleResponseSchema,
  })
  @ApiResponse({
    status: 404,
    description: 'Newsletter subscription not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateNewsletterDto: UpdateNewsletterDto,
  ) {
    return this.newsletterService.update(id, updateNewsletterDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a newsletter subscription (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Newsletter subscription deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Newsletter subscription not found',
  })
  remove(@Param('id') id: string) {
    return this.newsletterService.remove(id);
  }
}
