import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/logger/logger.service';
import { successResponse, failureResponse } from '../utils/response';
import { SendEmailDto } from './dto/send-email.dto';
import { PrismaService } from '../prisma/prisma.service';
import { generateCustomerReference } from './helpers/customer-reference';
import { EmailTierService } from './email-tier.service';

@Injectable()
export class BulkEmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly emailTierService: EmailTierService,
  ) {}

  async getWalletBalance() {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    
    if (!emailUser || !emailPassword) {
      return failureResponse(500, 'Email credentials are not configured');
    }

    this.logger.log('Fetching email wallet balance...', 'BulkEmail');

    try {
      // For Gmail SMTP, we don't have a direct balance API like SMS providers
      // We'll maintain a local wallet balance system
      const emailWallet = await this.prisma.emailWallet.findFirst({
        where: { kind: 'provider_synced', provider: 'gmail_smtp' },
      });

      if (!emailWallet) {
        // Create initial wallet if it doesn't exist
        const newWallet = await this.prisma.emailWallet.create({
          data: {
            kind: 'provider_synced',
            provider: 'gmail_smtp',
            totalBalance: 0,
            emailWallet: 0,
            currentBalance: 0,
          },
        });

        return successResponse(
          200,
          true,
          'Email wallet initialized',
          undefined,
          {
            totalBalance: 0,
            emailWallet: 0,
            currentBalance: 0,
            provider: 'gmail_smtp',
          },
        );
      }

      return successResponse(
        200,
        true,
        'Email wallet balance retrieved successfully',
        undefined,
        {
          totalBalance: emailWallet.totalBalance || 0,
          emailWallet: emailWallet.emailWallet || 0,
          currentBalance: emailWallet.currentBalance || 0,
          provider: emailWallet.provider,
        },
      );
    } catch (error: any) {
      this.logger.error('Error fetching email wallet balance', error?.stack || error, 'BulkEmail');
      return failureResponse(500, 'Error fetching wallet balance');
    }
  }

  async sendEmail(dto: SendEmailDto) {
    this.logger.log('Sending bulk email...', 'BulkEmail');

    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    
    if (!emailUser || !emailPassword) {
      this.logger.error('Email credentials are not configured', 'BulkEmail');
      return failureResponse(500, 'Email credentials are not configured');
    }

    try {
      // Parse recipients
      const toArray = dto.to.split(',').map(s => s.trim()).filter(Boolean);
      const ccArray = dto.cc ? dto.cc.split(',').map(s => s.trim()).filter(Boolean) : [];
      const bccArray = dto.bcc ? dto.bcc.split(',').map(s => s.trim()).filter(Boolean) : [];
      
      // Generate customer reference if not provided
      const customerReference = dto.customerReference || generateCustomerReference();

      // Calculate cost based on email count
      const totalEmails = toArray.length + ccArray.length + bccArray.length;
      const tier = await this.emailTierService.getTierForEmailCount(totalEmails);
      const costPerEmail = tier?.pricePerEmail || 0.1; // Default cost
      const totalCost = totalEmails * costPerEmail;

      // Create email record in pending status
      const emailRecord = await this.prisma.email.create({
        data: {
          from: dto.from,
          fromName: dto.fromName,
          to: toArray,
          cc: ccArray,
          bcc: bccArray,
          subject: dto.subject,
          body: dto.body,
          contentType: dto.contentType || 'text/html',
          attachments: dto.attachments ? { attachments: dto.attachments.map(att => ({ ...att })) } : undefined,
          replyTo: dto.replyTo,
          priority: dto.priority || 'normal',
          platform: 'gmail_smtp',
          callbackUrl: dto.callbackUrl,
          customerReference,
          status: 'pending',
        },
      });

      // Create nodemailer transporter
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        host: this.configService.get<string>('GOOGLE_SMTP_HOST'),
        port: this.configService.get<number>('GOOGLE_SMTP_PORT') || 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });

      // Prepare attachments
      const attachments = dto.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
        disposition: att.disposition || 'attachment',
      })) || [];

      // Send email
      const mailOptions = {
        from: dto.fromName ? `${dto.fromName} <${dto.from}>` : dto.from,
        to: toArray.join(', '),
        cc: ccArray.length > 0 ? ccArray.join(', ') : undefined,
        bcc: bccArray.length > 0 ? bccArray.join(', ') : undefined,
        subject: dto.subject,
        html: dto.contentType === 'text/html' ? dto.body : undefined,
        text: dto.contentType === 'text/plain' ? dto.body : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        replyTo: dto.replyTo,
        priority: dto.priority || 'normal',
      };

      const result = await transporter.sendMail(mailOptions);

      // Update email record as sent
      await this.prisma.email.update({
        where: { id: emailRecord.id },
        data: {
          status: 'sent',
          providerMessageId: result.messageId,
          cost: totalCost,
          currency: 'NGN',
          responseRaw: {
            messageId: result.messageId,
            response: result.response,
            accepted: result.accepted,
            rejected: result.rejected,
          },
        },
      });

      // Update wallet balance
      await this.updateWalletBalance(totalCost, emailRecord.id, result.messageId);

      return successResponse(
        200,
        true,
        'Email sent successfully',
        undefined,
        {
          messageId: result.messageId,
          customerReference,
          totalCost,
          currency: 'NGN',
          recipients: totalEmails,
        },
      );
    } catch (error: any) {
      this.logger.error('Error sending bulk email', error?.stack || error, 'BulkEmail');
      
      // Update email record as failed
      try {
        await this.prisma.email.updateMany({
          where: { 
            status: 'pending', 
            subject: dto.subject, 
            from: dto.from 
          },
          data: { 
            status: 'failed',
            responseRaw: { error: error.message },
          },
        });
      } catch (updateError) {
        this.logger.error('Error updating failed email record', updateError, 'BulkEmail');
      }

      return failureResponse(500, 'Error sending email');
    }
  }

  private async updateWalletBalance(cost: number, emailId: string, messageId?: string) {
    try {
      const emailWallet = await this.prisma.emailWallet.findFirst({
        where: { kind: 'provider_synced', provider: 'gmail_smtp' },
      });

      if (emailWallet) {
        await this.prisma.$transaction([
          this.prisma.emailWallet.update({
            where: { id: emailWallet.id },
            data: { 
              lastAmountSpent: cost,
              currentBalance: (emailWallet.currentBalance || 0) - cost,
            },
          }),
          this.prisma.emailWalletTransaction.create({
            data: {
              walletId: emailWallet.id,
              type: 'debit',
              amount: cost,
              reference: messageId || emailId,
              meta: { source: 'email_send' },
            },
          }),
        ]);
      }
    } catch (error: any) {
      this.logger.error('Error updating email wallet balance', error?.stack || error, 'BulkEmail');
    }
  }

  async getEmailHistory(page: number = 1, limit: number = 10, status?: string) {
    try {
      const skip = (page - 1) * limit;
      
      const where = status ? { status: status as any } : {};
      
      const [emails, total] = await Promise.all([
        this.prisma.email.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            from: true,
            fromName: true,
            to: true,
            cc: true,
            bcc: true,
            subject: true,
            status: true,
            cost: true,
            currency: true,
            customerReference: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        this.prisma.email.count({ where }),
      ]);

      return successResponse(
        200,
        true,
        'Email history retrieved successfully',
        undefined,
        {
          emails,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      );
    } catch (error: any) {
      this.logger.error('Error fetching email history', error?.stack || error, 'BulkEmail');
      return failureResponse(500, 'Error fetching email history');
    }
  }

  async getEmailById(id: string) {
    try {
      const email = await this.prisma.email.findUnique({
        where: { id },
      });

      if (!email) {
        return failureResponse(404, 'Email not found');
      }

      return successResponse(
        200,
        true,
        'Email retrieved successfully',
        undefined,
        email,
      );
    } catch (error: any) {
      this.logger.error('Error fetching email by ID', error?.stack || error, 'BulkEmail');
      return failureResponse(500, 'Error fetching email');
    }
  }
}
