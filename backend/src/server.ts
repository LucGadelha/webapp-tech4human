
/// <reference types="node" />
import express, { Express, Request as ExpressRequest, Response as ExpressResponse, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { AppDataSource } from './config/dataSource'; // Ensured relative path
import { accountRouter } from './controllers/AccountController'; // Ensured relative path
import { transactionRouter } from './controllers/TransactionController'; // Ensured relative path
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors()); // Configure CORS appropriately for your frontend
app.use(express.json());

// Routes
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRouter);

app.get('/', (_req: ExpressRequest, res: ExpressResponse) => {
  res.send('Personal Finance Manager API is running!');
});

// Global error handler
const globalErrorHandler: ErrorRequestHandler = (
  err: any, 
  _req: ExpressRequest, 
  res: ExpressResponse, 
  _next: NextFunction // next is required in signature for error handler
) => {
  console.error(err.stack || err); // Log the error stack or the error itself
  res.status(500).send('Something broke!');
};
app.use(globalErrorHandler);


export const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
    
    // Check if migrations are needed/run them (optional, can be manual step)
    // await AppDataSource.runMigrations();
    // console.log('Migrations have been run (if any).');

    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (err) {
    console.error('Error during Data Source initialization or server start:', err);
    process.exit(1); // process.exit is a function
  }
};
