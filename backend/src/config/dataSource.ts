
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Account } from '../entities/Account'; // Changed from @/entities/Account
import { Transaction } from '../entities/Transaction'; // Changed from @/entities/Transaction
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || './database.sqlite',
  synchronize: false, // Set to false for production, use migrations instead
  logging: process.env.NODE_ENV === 'development', // Log SQL queries in development
  entities: [Account, Transaction],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  subscribers: [],
});