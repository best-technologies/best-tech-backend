import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guards';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUsersService } from './users.service';
import { QueryUsersDashboardDto } from './dto/query-users-dashboard.dto';
import { CreateAdminUserDto } from './dto/create-user.dto';
import { UpdateAdminUserDto } from './dto/update-user.dto';
import { UsersControllerDocs } from './doc/user.doc';

@UsersControllerDocs()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('dashboard')
  async getDashboard(
    @Query() query: QueryUsersDashboardDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.getDashboard(query);
    res.status(result.statusCode);
    return result;
  }

  @Post()
  async create(
    @Body() dto: CreateAdminUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.create(dto);
    res.status(result.statusCode);
    return result;
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.findOne(id);
    res.status(result.statusCode);
    return result;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.update(id, dto);
    res.status(result.statusCode);
    return result;
  }

  @Patch(':id/deactivate')
  async deactivate(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminUsersService.deactivate(id);
    res.status(result.statusCode);
    return result;
  }
}
