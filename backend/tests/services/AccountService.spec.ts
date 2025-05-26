
/// <reference types="jest" />
import { AccountService } from '../../src/services/AccountService'; // Changed from @/services/AccountService
import { Account } from '../../src/entities/Account'; // Changed from @/entities/Account
import { AccountType } from '../../src/constants/AccountType'; // Changed from @/constants/AccountType
import { AppDataSource } from '../../src/config/dataSource'; // Changed from @/config/dataSource
import { Repository } //, EntityManager 
from 'typeorm';
import { Transaction } from '../../src/entities/Transaction'; // Changed from @/entities/Transaction


// Mock TypeORM's getRepository and transaction
jest.mock('../../src/config/dataSource', () => ({ // Changed from @/config/dataSource
  AppDataSource: {
    getRepository: jest.fn(),
    manager: {
      transaction: jest.fn((cb) => cb(AppDataSource.manager)), // Mock transaction to execute callback
      save: jest.fn(),
      findOneBy: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      getRepository: jest.fn().mockReturnThis(), 
    },
    initialize: jest.fn().mockResolvedValue(undefined), // Mock initialize
    isInitialized: true, // Assume it's initialized for tests
  },
}));


describe('AccountService', () => {
  let accountService: AccountService;
  let mockAccountRepo: jest.Mocked<Repository<Account>>;
  let mockTransactionRepo: jest.Mocked<Repository<Transaction>>; 

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Provide mock implementations for repository methods
    mockAccountRepo = {
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as any; 

    mockTransactionRepo = {
      count: jest.fn(),
    } as any;

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Account) {
        return mockAccountRepo;
      }
      if (entity === Transaction) {
        return mockTransactionRepo;
      }
      throw new Error('Trying to get repository for unmocked entity');
    });
    
    (AppDataSource.manager.getRepository as jest.Mock).mockImplementation((entity) => {
        if (entity === Account) {
            return { findOneBy: mockAccountRepo.findOneBy, save: mockAccountRepo.save } as any;
        }
        throw new Error('Manager trying to get repository for unmocked entity');
    });
    (AppDataSource.manager.save as jest.Mock).mockImplementation(mockAccountRepo.save);


    accountService = new AccountService();
  });

  describe('createAccount', () => {
    it('should create and return an account with initial balance', async () => {
      const accountData = { name: 'Test Account', type: AccountType.CORRENTE, initialBalance: 100 };
      const expectedAccount = { id: 'uuid', ...accountData, currentBalance: 100, createdAt: new Date(), updatedAt: new Date() };
      mockAccountRepo.save.mockResolvedValue(expectedAccount as any);

      const result = await accountService.createAccount(accountData);

      expect(mockAccountRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        name: accountData.name,
        type: accountData.type,
        initialBalance: accountData.initialBalance,
        currentBalance: accountData.initialBalance,
      }));
      expect(result).toEqual(expectedAccount);
    });

    it('should create and return an account with zero initial balance if not provided', async () => {
      const accountData = { name: 'Test Account Zero Bal', type: AccountType.POUPANCA };
      const expectedAccount = { id: 'uuid', ...accountData, initialBalance: 0, currentBalance: 0, createdAt: new Date(), updatedAt: new Date() };
      mockAccountRepo.save.mockResolvedValue(expectedAccount as any);

      const result = await accountService.createAccount(accountData);
      expect(mockAccountRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        initialBalance: 0,
        currentBalance: 0,
      }));
      expect(result).toEqual(expectedAccount);
    });

    it('should throw error if name is missing', async () => {
      await expect(accountService.createAccount({ type: AccountType.CORRENTE } as any))
        .rejects.toThrow('Name and type are required for account creation.');
    });
    
    it('should throw error if initialBalance is negative', async () => {
      await expect(accountService.createAccount({ name: "Negative Test", type: AccountType.CORRENTE, initialBalance: -50 }))
        .rejects.toThrow('Initial balance cannot be negative.');
    });
  });

  describe('getAllAccounts', () => {
    it('should return an array of accounts', async () => {
      const accounts = [{ id: '1', name: 'Acc1', type: AccountType.CORRENTE, initialBalance: 0, currentBalance: 0, createdAt: new Date(), updatedAt: new Date() }];
      mockAccountRepo.find.mockResolvedValue(accounts as any);
      const result = await accountService.getAllAccounts();
      expect(result).toEqual(accounts);
      expect(mockAccountRepo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });
  });

   describe('deleteAccount', () => {
    beforeEach(() => {
        (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
            if (entity === Account) return mockAccountRepo;
            if (entity === Transaction) return mockTransactionRepo;
            throw new Error(`Mock for ${typeof entity === 'function' ? entity.name : entity} not configured`);
        });
        accountService = new AccountService(); 
    });


    it('should throw error if account has associated transactions', async () => {
        mockTransactionRepo.count.mockResolvedValue(1); 
        await expect(accountService.deleteAccount('some-id')).rejects.toThrow('Cannot delete account with associated transactions. Please delete transactions first.');
        expect(mockTransactionRepo.count).toHaveBeenCalledWith({
            where: [
                { sourceAccountId: 'some-id' },
                { destinationAccountId: 'some-id' }
            ]
        });
    });

    it('should delete account if no transactions are associated', async () => {
        mockTransactionRepo.count.mockResolvedValue(0); 
        mockAccountRepo.delete.mockResolvedValue({ affected: 1 } as any);
        await expect(accountService.deleteAccount('some-id')).resolves.not.toThrow();
        expect(mockAccountRepo.delete).toHaveBeenCalledWith('some-id');
    });
  });

  // Add more tests for getAccountById, updateAccount etc.
});