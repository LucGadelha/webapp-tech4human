
import { Router, Request, Response } from 'express';
import { AccountService } from '../services/AccountService'; // Changed from @/services/AccountService
import { AccountType } from '../constants/AccountType'; // Changed from @/constants/AccountType

export const accountRouter = Router();
const accountService = new AccountService();

accountRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, initialBalance } = req.body;
    if (!Object.values(AccountType).includes(type as AccountType)) {
        return res.status(400).json({ message: 'Invalid account type.' });
    }
    const account = await accountService.createAccount({ name, type, initialBalance });
    res.status(201).json(account);
  } catch (e: any) {
    const message = (e instanceof Error) ? e.message : String(e);
    res.status(400).json({ message });
  }
});

accountRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const accounts = await accountService.getAllAccounts();
    res.status(200).json(accounts);
  } catch (e: any) {
    const message = (e instanceof Error) ? e.message : 'Failed to retrieve accounts.';
    res.status(500).json({ message });
  }
});

accountRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const account = await accountService.getAccountById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    res.status(200).json(account);
  } catch (e: any) {
    const message = (e instanceof Error) ? e.message : String(e);
    res.status(400).json({ message });
  }
});

accountRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
     if (type && !Object.values(AccountType).includes(type as AccountType)) {
        return res.status(400).json({ message: 'Invalid account type.' });
    }
    const account = await accountService.updateAccount(req.params.id, { name, type });
    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    res.status(200).json(account);
  } catch (e: any) {
    const message = (e instanceof Error) ? e.message : String(e);
    res.status(400).json({ message });
  }
});

accountRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await accountService.deleteAccount(req.params.id);
    res.status(204).send();
  } catch (e: any) {
    let statusCode = 400;
    let message = (e instanceof Error) ? e.message : String(e);

    if (e instanceof Error) {
        if (e.message.includes('Cannot delete account with associated transactions')) {
            statusCode = 409; // Conflict
        } else if (e.message.includes('Account not found')) {
            statusCode = 404;
        }
    }
    res.status(statusCode).json({ message });
  }
});
