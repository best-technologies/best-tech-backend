import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/logger/logger.service';
import { successResponse, failureResponse } from '../utils/response';
import { SendSmsDto } from './dto/send-sms.dto';
import { PrismaService } from '../prisma/prisma.service';
import { generateCustomerReference } from './helpers/customer-reference';

@Injectable()
export class BulkSmsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
  ) {}

  async getWalletBalance() {
    const token = this.configService.get<string>('BULKSMSTOKEN');
    if (!token) {
      return failureResponse(500, 'BULKSMSTOKEN is not configured');
    }

    this.logger.log('Fetching BulkSMS wallet balance...', 'BulkSMS');

    try {
      const response = await axios.request({
        url: 'https://www.bulksmsnigeria.com/api/v2/balance',
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: {
          api_token: token,
        },
        timeout: 15000,
        maxRedirects: 10,
        validateStatus: () => true,
      });

      if (response.status >= 200 && response.status < 300) {
        const payload = response.data;

        // Upsert provider-synced admin wallet snapshot
        const balance = payload?.balance || {};
        const numeric = (v: any) => {
          const n = Number(v);
          return isNaN(n) ? null : n;
        };

        const existing = await this.prisma.smsWallet.findFirst({
          where: { kind: 'provider_synced', provider: 'bulksmsnigeria' },
        });

        if (existing) {
          await this.prisma.smsWallet.update({
            where: { id: existing.id },
            data: {
              totalBalance: numeric(balance.total_balance) ?? undefined,
              universalWallet: numeric(balance.universal_wallet) ?? undefined,
              smsWallet: numeric(balance.sms_wallet) ?? undefined,
              smsBonus: numeric(balance.sms_bonus) ?? undefined,
              mainBalance: numeric(balance.main_balance) ?? undefined,
              volumeBonus: numeric(balance.volume_bonus) ?? undefined,
              promoBonus: numeric(balance.promo_bonus) ?? undefined,
            },
          });
        } else {
          await this.prisma.smsWallet.create({
            data: {
              kind: 'provider_synced',
              provider: 'bulksmsnigeria',
              totalBalance: numeric(balance.total_balance) ?? undefined,
              universalWallet: numeric(balance.universal_wallet) ?? undefined,
              smsWallet: numeric(balance.sms_wallet) ?? undefined,
              smsBonus: numeric(balance.sms_bonus) ?? undefined,
              mainBalance: numeric(balance.main_balance) ?? undefined,
              volumeBonus: numeric(balance.volume_bonus) ?? undefined,
              promoBonus: numeric(balance.promo_bonus) ?? undefined,
            },
          });
        }

        return successResponse(
          200,
          true,
          payload?.data?.message || 'Balance fetched successfully',
          undefined,
          payload,
        );
      }

      return failureResponse(
        response.status || 500,
        response.data?.message || 'Failed to fetch balance',
      );
    } catch (error: any) {
      this.logger.error('Error fetching BulkSMS wallet balance', error?.stack || error, 'BulkSMS');
      return failureResponse(500, 'Error fetching wallet balance');
    }
  }

  async sendSms(dto: SendSmsDto) {
    this.logger.log('Sending BulkSMS message...', 'BulkSMS');

    const token = this.configService.get<string>('BULKSMSTOKEN');
    if (!token) {
      this.logger.error('BULKSMSTOKEN is not configured', 'BulkSMS');
      return failureResponse(500, 'BULKSMSTOKEN is not configured');
    }

    try {
      // Create SMS record in pending status
      const toArray = dto.to.split(',').map(s => s.trim()).filter(Boolean);
      // If caller didn't provide a reference, generate a unique one
      const customerReference = dto.customer_reference || generateCustomerReference();

      const smsRecord = await this.prisma.sms.create({
        data: {
          from: dto.from,
          to: toArray,
          body: dto.body,
          gateway: dto.gateway,
          appendSender: dto.append_sender,
          callbackUrl: dto.callback_url,
          customerReference,
          status: 'pending',
        },
      });

      const response = await axios.request({
        url: 'https://www.bulksmsnigeria.com/api/v2/sms',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: {
          api_token: token,
          from: dto.from,
          to: dto.to,
          body: dto.body,
          gateway: dto.gateway,
          append_sender: dto.append_sender,
          callback_url: dto.callback_url,
          customer_reference: customerReference,
        },
        timeout: 20000,
        maxRedirects: 10,
        validateStatus: () => true,
      });

      if (response.status >= 200 && response.status < 300) {
        const payload = response.data;

        // Extract cost, currency, message_id if present
        const data = payload?.data || {};
        const cost = typeof data.cost === 'number' ? data.cost : Number(data.cost);
        const currency = data.currency as string | undefined;
        const messageId = data.message_id as string | undefined;

        // Update SMS record as sent
        await this.prisma.sms.update({
          where: { id: smsRecord.id },
          data: {
            status: 'sent',
            providerMessageId: messageId,
            cost: isNaN(cost) ? undefined : cost,
            currency: currency,
            responseRaw: payload,
          },
        });

        // Update wallet snapshot with last amount spent if we can fetch balance
        if (!isNaN(cost)) {
          const providerWallet = await this.prisma.smsWallet.findFirst({
            where: { kind: 'provider_synced', provider: 'bulksmsnigeria' },
          });
          if (providerWallet) {
            await this.prisma.$transaction([
              this.prisma.smsWallet.update({
                where: { id: providerWallet.id },
                data: { lastAmountSpent: cost },
              }),
              this.prisma.smsWalletTransaction.create({
                data: {
                  walletId: providerWallet.id,
                  type: 'debit',
                  amount: cost,
                  reference: messageId || smsRecord.id,
                  meta: { source: 'sms_send' },
                },
              }),
            ]);
          }
        }

        return successResponse(
          200,
          true,
          data?.message || 'Message sent',
          undefined,
          payload,
        );
      }

      // Update SMS record as failed
      await this.prisma.sms.update({
        where: { id: smsRecord.id },
        data: {
          status: 'failed',
          responseRaw: response.data,
        },
      });

      return failureResponse(
        response.status || 500,
        response.data?.error?.message || response.data?.message || 'Failed to send message',
      );
    } catch (error: any) {
      this.logger.error('Error sending BulkSMS message', error?.stack || error, 'BulkSMS');
      // Best-effort failure update if smsRecord exists in scope
      try {
        // No-op if creation failed before
        await this.prisma.sms.updateMany({
          where: { status: 'pending', body: dto.body, from: dto.from },
          data: { status: 'failed' },
        });
      } catch {}
      return failureResponse(500, 'Error sending message');
    }
  }
}


