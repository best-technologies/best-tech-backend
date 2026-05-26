import { 
  Injectable, 
  ConflictException,
  UnauthorizedException, 
  InternalServerErrorException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Tokens } from './interfaces/tokens.interface';
import { AuthPayload } from './interfaces/auth-payload.interface';
import * as colors from 'colors';
import { failureResponse, successResponse } from 'src/utils/response';
import { formatDate } from 'src/common/helper-functions/formatter';
import { sendWelcomeEmail } from '../mailer/send-email';

@Injectable()
export class IdentityService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /////////////////////////                           Create a new user å/*  */
  /////////////////////////                           Create a new user å/*  */
  async createUser(signUpDto: CreateUserDto): Promise<any> {

    console.log(colors.green('Creating new User...'));

    try {
      const { email, password, firstName, lastName } = signUpDto;
  
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email }
      });
      if (existingUser) {
        console.log(colors.red('User with supplied email already exists'));
        return failureResponse(409, 'User with supplied email already exists', false);
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
            // Create new user
      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        }
      });

      // Send welcome email to the new user
      try {
        console.log(colors.blue(`Sending welcome email to ${email}`));
        
        await sendWelcomeEmail(
          email,
          firstName,
          lastName
        );
        
        console.log(colors.green('Welcome email sent successfully'));
      } catch (emailError) {
        console.error(colors.red('Error sending welcome email:'), emailError);
        // Don't fail the main operation if email fails
      }

      const formattedData = {
        id: newUser.id,
        role: newUser.role,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        createdAt: formatDate(newUser.createdAt),
        updatedAt: formatDate(newUser.updatedAt),
      };

      console.log(colors.magenta('New User successfully created'));
      return successResponse(201, true, 'New User successfully created', undefined, formattedData);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
  
      console.error(colors.red('Error in createNewUser:'), error);
  
      // You can throw a more specific exception depending on the nature of the error
      throw new InternalServerErrorException('Failed to create new user');
    }
  }
  

  async signIn(dto: SignInDto): Promise<Tokens> {
    console.log(colors.green('Signing in user...'));
    console.log('🔍 [SIGNIN SERVICE] Email received:', dto.email);
    console.log('🔍 [SIGNIN SERVICE] Password received (length):', dto.password?.length);
    console.log('🔍 [SIGNIN SERVICE] Password received (first 3 chars):', dto.password?.substring(0, 3));

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    
    if (!user) {
      console.log(colors.red('User not found'));
      return failureResponse(404, 'User not found', false);
    }

    console.log('🔍 [SIGNIN SERVICE] User found:', user.email);
    console.log('🔍 [SIGNIN SERVICE] Stored password hash (first 20 chars):', user.password?.substring(0, 20));

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    
    console.log('🔍 [SIGNIN SERVICE] Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log(colors.red('Invalid credentials'));
      console.log('🔍 [SIGNIN SERVICE] Password received:', dto.password);
      console.log('🔍 [SIGNIN SERVICE] Hash in DB:', user.password);
      return failureResponse(401, 'Invalid credentials', false);
    }

    // Generate tokens
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    const formattedUser = {
      accessToken: tokens.accessToken,
      id: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: (user.createdAt),
      updatedAt: (user.updatedAt),
    }

    console.log(colors.magenta('User signed in successfully'));
    return successResponse(
      200, 
      true, 
      'User signed in successfully', 
      undefined, 
      formattedUser);
  }

  async signout(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
  
    if (!user) {
      return failureResponse(404, 'User not found', false);
    }
  
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });
  
    return successResponse(200, true, 'User logged out successfully');
  }

  async refreshTokens(
    userId: string, 
    refreshToken: string
  ): Promise<Tokens> {
    // Find user by ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(200, true, 'Tokens refreshed successfully', undefined, {
      accessToken: tokens.accessToken,
    });
  }

  private async generateTokens(payload: AuthPayload): Promise<{ accessToken: string; refreshToken: string, role: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken, role: payload.role };
  }
}