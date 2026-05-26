import { PartialType } from '@nestjs/swagger';
import { CreateNewsletterTemplateDto } from './create-newsletter-template.dto';

export class UpdateNewsletterTemplateDto extends PartialType(
  CreateNewsletterTemplateDto,
) {}
