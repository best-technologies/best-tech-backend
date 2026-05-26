import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { LoggerService } from '../common/logger/logger.service';
import { PrismaClient } from './client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor(private logger: LoggerService) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ['info', 'warn', 'error'],
    });

    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      const databaseUrl = process.env.DATABASE_URL || 'unknown';
      this.logger.logDatabaseConnection(databaseUrl, true);
      this.logger.log('🔌 Prisma client connected', 'Prisma');
    } catch (error) {
      const databaseUrl = process.env.DATABASE_URL || 'unknown';
      this.logger.logDatabaseConnection(databaseUrl, false);
      this.logger.error('Failed to connect to database', error.stack, 'Prisma');
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    this.logger.log('Prisma client disconnected', 'Prisma');
  }
}
