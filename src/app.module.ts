import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { IdentityModule } from './identity/identity.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { ServicesModule } from './services/services.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BulkSmsModule } from './bulk-sms/bulk-sms.module';
import { BulkEmailModule } from './bulk-email/bulk-email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    LoggerModule,
    PrismaModule,
    IdentityModule,
    UsersModule,
    AdminModule,
    ServicesModule,
    ContactUsModule,
    NewsletterModule,
    BulkSmsModule,
    BulkEmailModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
