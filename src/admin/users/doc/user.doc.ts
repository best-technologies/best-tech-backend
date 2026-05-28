import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

export const UsersControllerDocs = () =>
  applyDecorators(ApiTags('Admin - Users'), ApiBearerAuth('JWT-auth'));
