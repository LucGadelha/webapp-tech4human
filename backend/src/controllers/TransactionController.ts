
import { Router, Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService'; // Changed from @/services/TransactionService
import { TransactionType } from '../constants/TransactionType'; // Changed from @/constants/TransactionType

export const transactionRouter = Router();
const transactionService = new TransactionService();

transactionRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { type, amount, date, description, sourceAccountId, destinationAccountId } = req.body;
     if (!Object.values(TransactionType).includes(type as TransactionType)) {
        return res.status(400).json({ message: 'Invalid transaction type.' });
    }
    const transaction = await transactionService.createTransaction({
      type, amount, date, description, sourceAccountId, destinationAccountId,
    });
    res.status(201).json(transaction);
  } catch (e: any) {
    const message = (e instanceof Error) ? e.message : String(e);
    res.status(400).json({ message });
  }
});

transactionRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { accountId, startDate, endDate } = req.query;
    const transactions = await transactionService.getAllTransactions({
        accountId: accountId as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined
    });
    res.status(200).json(transactions);
  } catch (e: any) {
    const message = (e instanceof Error) ? e.message : 'Failed to retrieve transactions.';
    res.status(500).json({ message });
  }
});

transactionRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await transactionService.deleteTransaction(req.params.id);
    res.status(204).send();
  } catch (e: any) {
    let statusCode = 400;
    let message = (e instanceof Error) ? e.message : String(e);

    if (e instanceof Error && e.message) { // Ensure e.message exists
        if (e.message.includes('Transaction not found')) {
            statusCode = 404;
        }
    }
    res.status(statusCode).json({ message });
  }
});
