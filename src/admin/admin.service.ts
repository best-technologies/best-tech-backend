import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as colors from 'colors';
import { successResponse } from 'src/utils/response';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(userpayload: any, roleFilter?: string) {
    console.log(colors.green('Fetching users...'));

    try {
      let whereClause = {};
      if (roleFilter) {
        whereClause = { role: roleFilter };
      }

      const users = await this.prisma.user.findMany({
        where: whereClause,
      });

      if (!users || users.length === 0) {
        console.log(colors.red('No users found'));
        return successResponse(200, true, 'No users found', 0);
      }
      console.log(colors.green(`Total of ${users.length} users found`));

      const formattedUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return successResponse(
        200,
        true,
        'Users fetched successfully',
        users.length,
        formattedUsers,
      );
    } catch (error) {
      console.error(colors.red('Error fetching users:'));
      return successResponse(500, false, 'Error fetching users');
    }
  }

  // This function fetches the dashboard data for the admin
  async getDashboard(userpayload: any) {
    console.log(colors.green('Fetching dashboard data...'));

    const loggedInUser = await this.prisma.user.findUnique({
      where: { id: userpayload.userId },
    });
    // console.log("logged in user: ", loggedInUser);

    try {
      const totalUsers = await this.prisma.user.count();
      const totalServices = await this.prisma.service.count();
      const totalCategories = await this.prisma.category.count();
      const totalEnrollments = 0;
      const totalRevenues = 0;

      const formattedRes = {
        totalUsers,
        totalServices,
        totalCategories,
        totalEnrollments,
        totalRevenues,
        loggedInUser: {
          id: loggedInUser?.id,
          email: loggedInUser?.email,
          firstName: loggedInUser?.firstName,
          lastName: loggedInUser?.lastName,
          role: loggedInUser?.role,
          createdAt: loggedInUser?.createdAt,
          updatedAt: loggedInUser?.updatedAt,
        },
      };

      return successResponse(
        200,
        true,
        'Dashboard data fetched successfully',
        undefined,
        {
          formattedRes,
        },
      );
    } catch (error) {
      console.error(colors.red('Error fetching dashboard data: '), error);
      return successResponse(500, false, 'Error fetching dashboard data');
    }
  }
}
