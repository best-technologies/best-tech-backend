import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUsersModule } from './users/users.module';
import { AdminAuthModule } from './auth/auth.module';
import { ServicesModule } from 'src/services/services.module';
import { DepartmentModule } from './department/department.module';

@Module({
  imports: [
    AdminUsersModule,
    AdminAuthModule,
    ServicesModule,
    DepartmentModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
