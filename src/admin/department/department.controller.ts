import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guards';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreateDepartmentDocs,
  DeleteDepartmentDocs,
  DepartmentControllerDocs,
  FindAllDepartmentsDocs,
  FindOneDepartmentDocs,
  UpdateDepartmentDocs,
} from './doc/department.doc';

@DepartmentControllerDocs()
@Controller('admin/departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @CreateDepartmentDocs()
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.departmentService.create(createDepartmentDto);
    res.status(result.statusCode);
    return result;
  }

  @Get()
  @FindAllDepartmentsDocs()
  async findAll(@Res({ passthrough: true }) res: Response) {
    const result = await this.departmentService.findAll();
    res.status(result.statusCode);
    return result;
  }

  @Get(':id')
  @FindOneDepartmentDocs()
  async findOne(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.departmentService.findOne(id);
    res.status(result.statusCode);
    return result;
  }

  @Put(':id')
  @UpdateDepartmentDocs()
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.departmentService.update(id, updateDepartmentDto);
    res.status(result.statusCode);
    return result;
  }

  @Delete(':id')
  @DeleteDepartmentDocs()
  async remove(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.departmentService.remove(id);
    res.status(result.statusCode);
    return result;
  }
}
