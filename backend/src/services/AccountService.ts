
import { AppDataSource } from '../config/dataSource'; // Changed from @/config/dataSource
import { Account } from '../entities/Account'; // Changed from @/entities/Account
import { AccountType } from '../constants/AccountType'; // Changed from @/constants/AccountType
import { Repository, EntityManager } from 'typeorm';
import { Transaction } from '../entities/Transaction'; // Changed from @/entities/Transaction

interface CreateAccountDTO {
  name: string;
  type: AccountType;
  initialBalance?: number;
}

interface UpdateAccountDTO {
  name?: string;
  type?: AccountType;
}

export class AccountService {
  private accountRepository: Repository<Account>;
  private transactionRepository: Repository<Transaction>;

  constructor() {
    this.accountRepository = AppDataSource.getRepository(Account);
    this.transactionRepository = AppDataSource.getRepository(Transaction);
  }

  async createAccount(data: CreateAccountDTO): Promise<Account> {
    if (!data.name || !data.type) {
      throw new Error('Name and type are required for account creation.');
    }
    if (data.initialBalance && data.initialBalance < 0) {
        throw new Error('Initial balance cannot be negative.');
    }

    const account = new Account();
    account.name = data.name;
    account.type = data.type;
    account.initialBalance = data.initialBalance || 0;
    account.currentBalance = data.initialBalance || 0;

    return this.accountRepository.save(account);
  }

  async getAllAccounts(): Promise<Account[]> {
    return this.accountRepository.find({ order: { name: 'ASC' } });
  }

  async getAccountById(id: string): Promise<Account | null> {
    if (!id) throw new Error('Account ID is required.');
    return this.accountRepository.findOneBy({ id });
  }

  async updateAccount(id: string, data: UpdateAccountDTO): Promise<Account | null> {
    if (!id) throw new Error('Account ID is required for update.');
    const account = await this.getAccountById(id);
    if (!account) {
      return null;
    }

    if (data.name) account.name = data.name;
    if (data.type) account.type = data.type;
    // Initial balance is not updatable post-creation through this method

    return this.accountRepository.save(account);
  }

  async deleteAccount(id: string): Promise<void> {
    if (!id) throw new Error('Account ID is required for deletion.');
    
    const transactionCount = await this.transactionRepository.count({
      where: [
        { sourceAccountId: id },
        { destinationAccountId: id }
      ]
    });

    if (transactionCount > 0) {
      throw new Error('Cannot delete account with associated transactions. Please delete transactions first.');
    }

    const result = await this.accountRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Account not found for deletion.');
    }
  }
  
  async updateBalanceInTransaction(
    manager: EntityManager,
    accountId: string,
    amount: number,
    isDebit: boolean // true for debit, false for credit
  ): Promise<Account> {
    const accountRepository = manager.getRepository(Account);
    const account = await accountRepository.findOneBy({ id: accountId });
    if (!account) {
      throw new Error(`Account with ID ${accountId} not found for balance update.`);
    }
    
    if (isDebit) {
      if (account.currentBalance < amount) {
        throw new Error(`Insufficient funds in account ${account.name}.`);
      }
      account.currentBalance -= amount;
    } else {
      account.currentBalance += amount;
    }
    return manager.save(account);
  }
}