import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IdentityService } from './identity.service';
import { CreateUserDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtAuthGuard, JwtRefreshGuard } from './guards/jwt-auth.guard';
import { successResponse } from 'src/utils/response';

@ApiTags('Authentication')
@Controller('identity')
export class IdentityController {
  constructor(private identityService: IdentityService) {}

  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'New User successfully created' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx1234567890' },
            role: { type: 'string', example: 'user' },
            email: { type: 'string', example: 'john.doe@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User with supplied email already exists',
  })
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto, @Res() res: Response) {
    const result = await this.identityService.createUser(dto);
    return res.status(result.statusCode).json(result);
  }

  @ApiOperation({ summary: 'Sign in user with email and password' })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User signed in successfully' },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            id: { type: 'string', example: 'clx1234567890' },
            role: { type: 'string', example: 'user' },
            email: { type: 'string', example: 'john.doe@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: SignInDto, @Res() res: Response) {
    console.log(
      '🔍 [SIGNIN CONTROLLER] Received payload:',
      JSON.stringify(dto, null, 2),
    );
    console.log('🔍 [SIGNIN CONTROLLER] Email:', dto.email);
    console.log(
      '🔍 [SIGNIN CONTROLLER] Password length:',
      dto.password?.length,
    );
    console.log('🔍 [SIGNIN CONTROLLER] Password type:', typeof dto.password);
    const result = await this.identityService.signIn(dto);
    return res.status(Number(result.statusCode)).json(result);
  }

  @ApiOperation({ summary: 'Sign out user (requires authentication)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'User signed out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@Req() req: Request) {
    await this.identityService.signout(req.user!.userId);
    return successResponse(200, true, 'User signed out successfully');
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Req() req: Request) {
    const authorizationHeader = req.get('Authorization');
    const refreshToken = authorizationHeader
      ? authorizationHeader.split(' ')[1]
      : null;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const tokens = await this.identityService.refreshTokens(
      req.user!.userId,
      refreshToken,
    );

    return { accessToken: tokens.accessToken };
  }
}

// @Post('signin')
// async signin(@Body() body: any, @Res() res: Response) {
//   const result = await this.identityService.signin(body);
//   return res.status(result.statusCode).json(result);
// }
