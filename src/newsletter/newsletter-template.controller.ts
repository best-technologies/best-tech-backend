import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  Req,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guards';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { NewsletterTemplateService } from './newsletter-template.service';
import { CreateNewsletterTemplateDto } from './dto/create-newsletter-template.dto';
import { UpdateNewsletterTemplateDto } from './dto/update-newsletter-template.dto';
import { QueryNewsletterTemplateDto } from './dto/query-newsletter-template.dto';

@ApiTags('Newsletter Templates - Admin')
@ApiBearerAuth()
@Controller('admin/newsletter/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class NewsletterTemplateController {
  constructor(
    private readonly newsletterTemplateService: NewsletterTemplateService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new newsletter template (draft)',
    description:
      'Creates a newsletter template in draft status. Use the /send endpoint to actually send it to subscribers.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Newsletter template data with optional images. Template will be created as draft by default.',
    type: CreateNewsletterTemplateDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Newsletter template created successfully as draft',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  async create(
    @Body() createNewsletterTemplateDto: CreateNewsletterTemplateDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Req() req: any,
  ) {
    const imageFiles = files?.images || [];
    console.log('User from request:', req.user);
    console.log('User ID:', req.user?.userId);
    return this.newsletterTemplateService.create(
      createNewsletterTemplateDto,
      req.user?.userId, // Use 'userId' field which contains the user ID
      imageFiles,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all newsletter templates with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Newsletter templates retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() queryDto: QueryNewsletterTemplateDto) {
    return this.newsletterTemplateService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a newsletter template by ID' })
  @ApiResponse({
    status: 200,
    description: 'Newsletter template retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Newsletter template not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string) {
    return this.newsletterTemplateService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a newsletter template' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Newsletter template update data with optional images',
    type: UpdateNewsletterTemplateDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Newsletter template updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Newsletter template not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  async update(
    @Param('id') id: string,
    @Body() updateNewsletterTemplateDto: UpdateNewsletterTemplateDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    const imageFile = files?.images?.[0]; // For update, we'll handle single image replacement
    return this.newsletterTemplateService.update(
      id,
      updateNewsletterTemplateDto,
      imageFile,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a newsletter template' })
  @ApiResponse({
    status: 200,
    description: 'Newsletter template deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Newsletter template not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string) {
    return this.newsletterTemplateService.remove(id);
  }

  @Post(':id/send')
  @ApiOperation({
    summary: 'Send newsletter to all subscribers',
    description:
      'Sends the newsletter template to all subscribed users. This will change the template status to "sent" and track delivery statistics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Newsletter sent successfully to all subscribers',
  })
  @ApiResponse({ status: 404, description: 'Newsletter template not found' })
  @ApiResponse({
    status: 400,
    description: 'Newsletter already sent or no subscribers found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async sendNewsletter(@Param('id') id: string) {
    return this.newsletterTemplateService.sendNewsletter(id);
  }
}
