import { PartialType } from '@nestjs/swagger';
import { CreateEmailTierDto } from './create-email-tier.dto';

export class UpdateEmailTierDto extends PartialType(CreateEmailTierDto) {}
