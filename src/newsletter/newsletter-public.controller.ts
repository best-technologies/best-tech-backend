import { Controller, Post, Body, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { NewsletterCreateResponseSchema } from './schemas/newsletter-response.schema';

@ApiTags('Newsletter - Public')
@Controller('newsletter')
export class NewsletterPublicController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to newsletter (Public)' })
  @ApiResponse({
    status: 201,
    description: 'Successfully subscribed to newsletter',
    schema: NewsletterCreateResponseSchema,
  })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  subscribe(@Body() createNewsletterDto: CreateNewsletterDto) {
    return this.newsletterService.create(createNewsletterDto);
  }

  @Delete('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from newsletter by email (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully unsubscribed from newsletter',
  })
  @ApiResponse({
    status: 404,
    description: 'Email not found in newsletter subscription',
  })
  unsubscribe(@Query('email') email: string) {
    return this.newsletterService.unsubscribe(email);
  }
}
