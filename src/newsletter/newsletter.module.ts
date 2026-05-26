import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterPublicController } from './newsletter-public.controller';
import { NewsletterTemplateController } from './newsletter-template.controller';
import { NewsletterService } from './newsletter.service';
import { NewsletterTemplateService } from './newsletter-template.service';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, LoggerModule, ConfigModule],
  controllers: [
    NewsletterController,
    NewsletterPublicController,
    NewsletterTemplateController,
  ],
  providers: [NewsletterService, NewsletterTemplateService, CloudinaryService],
  exports: [NewsletterService, NewsletterTemplateService],
})
export class NewsletterModule {}
