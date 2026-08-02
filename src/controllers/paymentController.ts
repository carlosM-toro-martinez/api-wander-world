import { Request, Response } from 'express';
import { AirtmService, AirtmWebhookPayload } from '../services/airtmService';
import { PaymentService } from '../services/paymentService';
import { getIdParam } from '../utils/request';

export class PaymentController {
  static async getMethods(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      if (req.query.userId && (!userId || Number.isNaN(userId))) {
        res.status(400).json({ error: 'Invalid userId' });
        return;
      }
      const records = await PaymentService.getMethods(userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createMethod(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type, brand, last4, holderName, isDefault } = req.body as {
        userId?: number | string;
        type?: string;
        brand?: string;
        last4?: string;
        holderName?: string;
        isDefault?: boolean;
      };
      const parsedUserId = Number(userId);
      if (!parsedUserId || Number.isNaN(parsedUserId) || !type) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      const record = await PaymentService.createMethod({
        userId: parsedUserId,
        type,
        brand,
        last4,
        holderName,
        isDefault,
      });
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteMethod(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      await PaymentService.deleteMethod(id);
      res.status(204).send();
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2025') {
        res.status(404).json({ error: 'Payment method not found' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createIntent(req: Request, res: Response): Promise<void> {
    try {
      const { userId, bookingId, amount, currency, provider } = req.body as {
        userId?: number | string;
        bookingId?: number | string;
        amount?: number | string;
        currency?: string;
        provider?: string;
      };
      const parsedUserId = Number(userId);
      const parsedBookingId = bookingId ? Number(bookingId) : null;
      const parsedAmount = Number(amount);
      if (!parsedUserId || Number.isNaN(parsedUserId) || !parsedAmount || parsedAmount <= 0) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      if (bookingId && (!parsedBookingId || Number.isNaN(parsedBookingId))) {
        res.status(400).json({ error: 'Invalid bookingId' });
        return;
      }
      const record = await PaymentService.createIntent({
        userId: parsedUserId,
        bookingId: parsedBookingId,
        amount: parsedAmount,
        currency,
        provider,
      });
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createAirtmCheckout(req: Request, res: Response): Promise<void> {
    try {
      const { amountUsd, montoUsd, id_reserva_local, localBookingId, tourist, turista } =
        req.body as {
          amountUsd?: number | string;
          montoUsd?: number | string;
          id_reserva_local?: number | string;
          localBookingId?: number | string;
          tourist?: {
            fullName?: string;
            email?: string;
            phone?: string;
            country?: string;
          };
          turista?: {
            fullName?: string;
            nombre?: string;
            email?: string;
            phone?: string;
            telefono?: string;
            country?: string;
            pais?: string;
          };
        };

      const parsedAmount = Number(amountUsd ?? montoUsd);
      const parsedBookingId = Number(id_reserva_local ?? localBookingId);
      const touristPayload = (tourist ?? turista) as
        | {
            fullName?: string;
            nombre?: string;
            email?: string;
            phone?: string;
            telefono?: string;
            country?: string;
            pais?: string;
          }
        | undefined;
      const fullName = touristPayload?.fullName ?? touristPayload?.nombre;
      const phone = touristPayload?.phone ?? touristPayload?.telefono;
      const country = touristPayload?.country ?? touristPayload?.pais;

      if (
        !parsedAmount ||
        Number.isNaN(parsedAmount) ||
        parsedAmount <= 0 ||
        !parsedBookingId ||
        Number.isNaN(parsedBookingId) ||
        !fullName ||
        !touristPayload?.email
      ) {
        res.status(400).json({ error: 'Missing or invalid AirTM checkout fields' });
        return;
      }

      const checkout = await AirtmService.createCheckout({
        amountUsd: parsedAmount,
        localBookingId: parsedBookingId,
        tourist: {
          fullName,
          email: touristPayload.email,
          phone,
          country,
        },
      });

      res.status(201).json({
        checkoutUrl: checkout.checkoutUrl,
        payinId: checkout.payin.id,
        code: checkout.payin.code,
        status: checkout.payin.status,
        amount: checkout.payin.amount,
      });
    } catch (error) {
      if (AirtmService.isAirtmError(error)) {
        res.status(error.status ?? 502).json({
          error: error.message,
          details: error.details,
        });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async airtmWebhook(req: Request, res: Response): Promise<void> {
    try {
      const result = await AirtmService.processWebhook(req.body as AirtmWebhookPayload);

      res.status(200).json({
        received: true,
        processed: result.processed,
        bookingId: result.bookingId,
        paymentId: result.paymentId,
        status: result.status,
      });
    } catch (error) {
      if (AirtmService.isAirtmError(error)) {
        res.status(error.status ?? 400).json({
          error: error.message,
          details: error.details,
        });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createAirtmWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const { amountUsd, montoUsd, bankDestination, destinoBancario } = req.body as {
        amountUsd?: number | string;
        montoUsd?: number | string;
        bankDestination?: {
          externalAccountId?: string;
          paymentRail?: string;
          bankName?: string;
          accountHolderName?: string;
          accountNumber?: string;
          currency?: string;
          countryCode?: string;
        };
        destinoBancario?: {
          externalAccountId?: string;
          external_account_id?: string;
          paymentRail?: string;
          payment_rail?: string;
          bankName?: string;
          banco?: string;
          accountHolderName?: string;
          titular?: string;
          accountNumber?: string;
          numeroCuenta?: string;
          currency?: string;
          moneda?: string;
          countryCode?: string;
          pais?: string;
        };
      };

      const parsedAmount = Number(amountUsd ?? montoUsd);
      const destination = bankDestination ?? destinoBancario;
      const externalAccountId =
        destination?.externalAccountId ??
        (destination as { external_account_id?: string } | undefined)?.external_account_id;

      if (!parsedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !externalAccountId) {
        res.status(400).json({ error: 'Missing or invalid AirTM withdrawal fields' });
        return;
      }

      const withdrawal = await AirtmService.createWithdrawal({
        amountUsd: parsedAmount,
        bankDestination: {
          externalAccountId,
          paymentRail:
            destination?.paymentRail ??
            (destination as { payment_rail?: string } | undefined)?.payment_rail,
          bankName: destination?.bankName ?? (destination as { banco?: string } | undefined)?.banco,
          accountHolderName:
            destination?.accountHolderName ??
            (destination as { titular?: string } | undefined)?.titular,
          accountNumber:
            destination?.accountNumber ??
            (destination as { numeroCuenta?: string } | undefined)?.numeroCuenta,
          currency:
            destination?.currency ?? (destination as { moneda?: string } | undefined)?.moneda,
          countryCode:
            destination?.countryCode ?? (destination as { pais?: string } | undefined)?.pais,
        },
      });

      res.status(201).json(withdrawal);
    } catch (error) {
      if (AirtmService.isAirtmError(error)) {
        res.status(error.status ?? 502).json({
          error: error.message,
          details: error.details,
        });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async confirm(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.body as { paymentId?: number | string };
      const id = Number(paymentId);
      if (!id || Number.isNaN(id)) {
        res.status(400).json({ error: 'Missing paymentId' });
        return;
      }
      const record = await PaymentService.confirm(id);
      res.json(record);
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2025') {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      const record = await PaymentService.getPayment(id);
      if (!record) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
