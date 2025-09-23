import { PartialType } from '@nestjs/swagger';
import { CreateSmsTierDto } from './create-sms-tier.dto';

export class UpdateSmsTierDto extends PartialType(CreateSmsTierDto) {}


