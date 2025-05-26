
import { AppDataSource } from '../config/dataSource'; // Changed from @/config/dataSource
import { Transaction } from '../entities/Transaction'; // Changed from @/entities/Transaction
import { Account } from '../entities/Account'; // Changed from @/entities/Account
import { TransactionType } from '../constants/TransactionType'; // Changed from @/constants/TransactionType
import { Repository, EntityManager } from 'typeorm';
import { AccountService } from './AccountService'; // No change needed if AccountService is in the same dir

export class TransactionService {
  private transactionRepository: Repository<Transaction>;
  private accountService: AccountService;

  constructor() {
    this.transactionRepository = AppDataSource.getRepository(Transaction);
    this.accountService = new AccountService(); // Consider dependency injection
  }

  async createTransaction(data: CreateTransactionDTO): Promise<Transaction> {
    if (data.amount <= 0) {
      throw new Error('Transaction amount must be positive.');
    }
    if (!data.date) {
      throw new Error('Transaction date is required.');
    }

    const transaction = new Transaction();
    transaction.type = data.type;
    transaction.amount = data.amount;
    transaction.date = data.date;
    transaction.description = data.description;

    return AppDataSource.manager.transaction(async (entityManager: EntityManager) => {
      if (data.type === TransactionType.DEBITO || data.type === TransactionType.TRANSFERENCIA) {
        if (!data.sourceAccountId) throw new Error('Source account is required for debit/transfer.');
        await this.accountService.updateBalanceInTransaction(entityManager, data.sourceAccountId, data.amount, true);
        transaction.sourceAccountId = data.sourceAccountId;
      }

      if (data.type === TransactionType.CREDITO || data.type === TransactionType.TRANSFERENCIA) {
        if (!data.destinationAccountId) throw new Error('Destination account is required for credit/transfer.');
        if (data.type === TransactionType.TRANSFERENCIA && data.sourceAccountId === data.destinationAccountId) {
            throw new Error('Source and destination accounts cannot be the same for a transfer.');
        }
        await this.accountService.updateBalanceInTransaction(entityManager, data.destinationAccountId, data.amount, false);
        transaction.destinationAccountId = data.destinationAccountId;
      }
      
      return entityManager.save(Transaction, transaction);
    });
  }

  async getAllTransactions(filters: { accountId?: string, startDate?: string, endDate?: string }): Promise<Transaction[]> {
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.sourceAccount', 'sourceAccount')
      .leftJoinAndSelect('transaction.destinationAccount', 'destinationAccount')
      .orderBy('transaction.date', 'DESC')
      .addOrderBy('transaction.createdAt', 'DESC');

    if (filters.accountId) {
      queryBuilder.andWhere('(transaction.sourceAccountId = :accountId OR transaction.destinationAccountId = :accountId)', { accountId: filters.accountId });
    }
    if (filters.startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate: filters.endDate });
    }
    
    return queryBuilder.getMany();
  }
  
  async getTransactionById(id: string): Promise<Transaction | null> {
    if (!id) throw new Error('Transaction ID is required.');
    return this.transactionRepository.findOne({
        where: { id },
        relations: ['sourceAccount', 'destinationAccount'],
    });
  }


  async deleteTransaction(id: string): Promise<void> {
    if (!id) throw new Error('Transaction ID is required for deletion.');

    const transactionToDelete = await this.getTransactionById(id);
    if (!transactionToDelete) {
      throw new Error('Transaction not found for deletion.');
    }

    await AppDataSource.manager.transaction(async (entityManager: EntityManager) => {
      // Revert balance changes
      if (transactionToDelete.type === TransactionType.DEBITO || transactionToDelete.type === TransactionType.TRANSFERENCIA) {
        if (transactionToDelete.sourceAccountId) {
          // Credit back the source account
          await this.accountService.updateBalanceInTransaction(entityManager, transactionToDelete.sourceAccountId, transactionToDelete.amount, false);
        }
      }
      if (transactionToDelete.type === TransactionType.CREDITO || transactionToDelete.type === TransactionType.TRANSFERENCIA) {
        if (transactionToDelete.destinationAccountId) {
          // Debit back the destination account
          await this.accountService.updateBalanceInTransaction(entityManager, transactionToDelete.destinationAccountId, transactionToDelete.amount, true);
        }
      }
      
      const result = await entityManager.delete(Transaction, id);
      if (result.affected === 0) {
        // This should ideally not happen if findOneById found it, but as a safeguard
        throw new Error('Transaction not found during deletion process.');
      }
    });
  }
}
interface CreateTransactionDTO { // Define DTO locally if not imported from types
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  description?: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
}
