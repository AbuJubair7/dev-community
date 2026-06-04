import { DataSourceOptions } from 'typeorm';
import 'dotenv/config';

export const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [],
  migrations: ['src/config/migrations/*.ts'],
};

export default dbConfig;
