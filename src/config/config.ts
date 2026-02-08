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
}

const config: Config = {
  env: process.env.NODE_ENV || 'dev',
  port: parseInt(process.env.PORT || '5000'),
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPort: process.env.DB_PORT,
};

export { config };