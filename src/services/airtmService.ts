import axios, { AxiosError, AxiosInstance } from 'axios';
import { config } from '../config/config';
import { prisma } from '../libs/prisma';

export type AirtmPayinStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'CANCELED'
  | 'PROCESSING'
  | 'FAILED'
  | 'BRIDGE_FAILED'
  | 'BRIDGE_CANCELED';

export type AirtmPayoutStatus =
  | 'CREATED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELED'
  | 'PROCESSING'
  | 'BRIDGE_COMPLETED'
  | 'BRIDGE_FAILED'
  | 'BRIDGE_CANCELED';

export type AirtmWithdrawalStatus =
  | 'CREATED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELED';

export interface TouristData {
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
}

export interface AirtmCreateCheckoutInput {
  amountUsd: number;
  localBookingId: number;
  tourist: TouristData;
}

interface AirtmPayinItemRequest {
  description: string;
  amount: number;
  quantity: number;
}

interface AirtmCreatePayinRequest {
  code: string;
  amount: number;
  description: string;
  items: AirtmPayinItemRequest[];
  confirmationUri: string;
  cancelUri: string;
}

export interface AirtmPayinItemResponse extends AirtmPayinItemRequest {
  id: string;
  payinId: string;
}

export interface AirtmPayinResponse {
  id: string;
  code: string;
  hash: string;
  status: AirtmPayinStatus;
  amount: number;
  netAmount: number;
  airtmFee: number;
  description: string;
  items: AirtmPayinItemResponse[];
  airtmUserId?: string | null;
  airtmUserEmail?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
  confirmationUri: string;
  cancelUri: string;
}

export interface AirtmCheckoutResponse {
  checkoutUrl: string;
  payin: AirtmPayinResponse;
}

export interface AirtmWebhookPayload<TData = AirtmPayinResponse | AirtmPayoutResponse> {
  type: string;
  data: TData;
}

export interface AirtmPayoutResponse {
  id: string;
  bulkPayoutId?: string | null;
  hash: string;
  code: string;
  airtmUserId?: string | null;
  airtmUserEmail?: string | null;
  requireIdVerified?: boolean;
  notes?: string | null;
  internalNote?: string | null;
  status: AirtmPayoutStatus;
  grossAmount: number;
  amount: number;
  netAmount: number;
  airtmFee: number;
  enterpriseFee: number;
  reasonCode?: number | null;
  reasonDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AirtmBankDestination {
  externalAccountId: string;
  paymentRail?: 'wire' | 'ach' | string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  currency?: 'BOB' | string;
  countryCode?: 'BO' | string;
}

interface AirtmCreateWithdrawalRequest {
  amount: number;
  externalAccountId: string;
  paymentRail: string;
}

export interface AirtmWithdrawalResponse {
  id: string;
  amount: number;
  externalAccountId: string;
  paymentRail: string;
  status: AirtmWithdrawalStatus;
  reasonCode?: number | null;
  reasonDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AirtmWithdrawalInput {
  amountUsd: number;
  bankDestination: AirtmBankDestination;
}

class AirtmApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AirtmApiError';
  }
}

function roundUsdAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function assertValidUsdAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AirtmApiError('Invalid USD amount');
  }
}

function createAirtmCode(localBookingId: number): string {
  return `booking-${localBookingId}-${Date.now()}`;
}

function extractBookingIdFromCode(code?: string | null): number | null {
  const match = code?.match(/^booking-(\d+)-/);
  if (!match) {
    return null;
  }

  const bookingId = Number(match[1]);
  return Number.isNaN(bookingId) ? null : bookingId;
}

function getCheckoutUrl(payinId: string): string {
  const baseUrl = config.airtmCheckoutBaseUrl.replace(/\/$/, '');
  return `${baseUrl}/payin/${payinId}`;
}

export class AirtmService {
  private static client: AxiosInstance | null = null;

  private static getClient(): AxiosInstance {
    if (!config.airtmApiKey || !config.airtmApiSecret) {
      throw new AirtmApiError('Missing AirTM credentials');
    }

    if (!this.client) {
      const credentials = Buffer.from(
        `${config.airtmApiKey}:${config.airtmApiSecret}`,
      ).toString('base64');

      this.client = axios.create({
        baseURL: config.airtmBaseUrl,
        timeout: 15000,
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
    }

    return this.client;
  }

  static isAirtmError(error: unknown): error is AirtmApiError {
    return error instanceof AirtmApiError;
  }

  private static normalizeError(error: unknown, fallbackMessage: string): AirtmApiError {
    if (error instanceof AirtmApiError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return new AirtmApiError(
        fallbackMessage,
        axiosError.response?.status,
        axiosError.response?.data ?? axiosError.message,
      );
    }

    return new AirtmApiError(fallbackMessage, undefined, error);
  }

  static async createCheckout(input: AirtmCreateCheckoutInput): Promise<AirtmCheckoutResponse> {
    try {
      assertValidUsdAmount(input.amountUsd);

      const booking = await prisma.booking.findUnique({
        where: { id: input.localBookingId },
        select: { id: true, userId: true, bookingNumber: true },
      });

      if (!booking) {
        throw new AirtmApiError('Booking not found', 404);
      }

      const amount = roundUsdAmount(input.amountUsd);
      const code = createAirtmCode(booking.id);
      const description = `Reserva ${booking.bookingNumber} - ${input.tourist.fullName}`;
      const payload: AirtmCreatePayinRequest = {
        code,
        amount,
        description,
        items: [
          {
            description: `Reserva turistica ${booking.bookingNumber}`,
            amount,
            quantity: 1,
          },
        ],
        confirmationUri: `${config.airtmSuccessUrl}?bookingId=${booking.id}`,
        cancelUri: `${config.airtmCancelUrl}?bookingId=${booking.id}`,
      };

      const response = await this.getClient().post<AirtmPayinResponse>('/payins', payload);

      await prisma.payment.create({
        data: {
          user: { connect: { id: booking.userId } },
          bookingId: booking.id,
          amount: Math.round(amount * 100),
          currency: 'USD',
          provider: 'airtm',
          providerIntentId: response.data.id,
          status: 'PENDING',
        },
      });

      return {
        checkoutUrl: getCheckoutUrl(response.data.id),
        payin: response.data,
      };
    } catch (error) {
      throw this.normalizeError(error, 'Unable to create AirTM checkout');
    }
  }

  static async processWebhook(payload: AirtmWebhookPayload): Promise<{
    processed: boolean;
    bookingId: number | null;
    paymentId?: number;
    status?: AirtmPayinStatus | AirtmPayoutStatus;
  }> {
    try {
      const eventType = payload.type?.toLowerCase();
      const payin = payload.data as AirtmPayinResponse;
      const status = payin.status?.toUpperCase() as AirtmPayinStatus | undefined;

      if (!eventType?.startsWith('payin.') && !payin.code) {
        return { processed: false, bookingId: null };
      }

      if (status !== 'CONFIRMED') {
        return {
          processed: false,
          bookingId: extractBookingIdFromCode(payin.code),
          status,
        };
      }

      const bookingId = extractBookingIdFromCode(payin.code);
      if (!bookingId) {
        throw new AirtmApiError('Missing booking id in AirTM payin code', 400);
      }

      const payment = await prisma.$transaction(async tx => {
        const existing = await tx.payment.findFirst({
          where: {
            provider: 'airtm',
            OR: [{ providerIntentId: payin.id }, { bookingId }],
          },
          orderBy: { createdAt: 'desc' },
        });

        let confirmedPayment = existing
          ? await tx.payment.update({
              where: { id: existing.id },
              data: {
                status: 'CONFIRMED',
                providerIntentId: payin.id,
              },
            })
          : null;

        if (!confirmedPayment) {
          const booking = await tx.booking.findUniqueOrThrow({
            where: { id: bookingId },
            select: { userId: true },
          });

          confirmedPayment = await tx.payment.create({
            data: {
              user: { connect: { id: booking.userId } },
              bookingId,
              amount: Math.round(payin.amount * 100),
              currency: 'USD',
              provider: 'airtm',
              providerIntentId: payin.id,
              status: 'CONFIRMED',
            },
          });
        }

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: 'PAID' },
        });

        return confirmedPayment;
      });

      return {
        processed: true,
        bookingId,
        paymentId: payment.id,
        status,
      };
    } catch (error) {
      throw this.normalizeError(error, 'Unable to process AirTM webhook');
    }
  }

  static async createWithdrawal(input: AirtmWithdrawalInput): Promise<AirtmWithdrawalResponse> {
    try {
      assertValidUsdAmount(input.amountUsd);

      if (!input.bankDestination.externalAccountId) {
        throw new AirtmApiError('Missing AirTM external bank account id');
      }

      const payload: AirtmCreateWithdrawalRequest = {
        amount: roundUsdAmount(input.amountUsd),
        externalAccountId: input.bankDestination.externalAccountId,
        paymentRail: input.bankDestination.paymentRail ?? 'wire',
      };

      const response = await this.getClient().post<AirtmWithdrawalResponse>(
        '/withdrawals',
        payload,
      );

      return response.data;
    } catch (error) {
      throw this.normalizeError(error, 'Unable to create AirTM withdrawal');
    }
  }
}
