import dotenv from 'dotenv';

dotenv.config();

interface Config {
  env: string;
  port: number;
  dbUser: string | undefined;
  dbPass: string | undefined;
  dbHost: string | undefined;
  dbName: string | undefined;
  dbPort: string | undefined;
  airtmApiKey: string | undefined;
  airtmApiSecret: string | undefined;
  airtmBaseUrl: string;
  airtmCheckoutBaseUrl: string;
  airtmSuccessUrl: string;
  airtmCancelUrl: string;
}

const config: Config = {
  env: process.env.NODE_ENV || 'dev',
  port: parseInt(process.env.PORT || '5000'),
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPort: process.env.DB_PORT,
  airtmApiKey: process.env.AIRTM_API_KEY,
  airtmApiSecret: process.env.AIRTM_API_SECRET,
  airtmBaseUrl: process.env.AIRTM_BASE_URL || 'https://api.enterprise.airtm.com/v2/',
  airtmCheckoutBaseUrl:
    process.env.AIRTM_CHECKOUT_BASE_URL || 'https://api.enterprise.airtm.com',
  airtmSuccessUrl:
    process.env.AIRTM_SUCCESS_URL ||
    process.env.FRONTEND_SUCCESS_URL ||
    'https://potosymasquehistoria.com/payment/success',
  airtmCancelUrl:
    process.env.AIRTM_CANCEL_URL ||
    process.env.FRONTEND_CANCEL_URL ||
    'https://potosymasquehistoria.com/payment/cancel',
};

export { config };
