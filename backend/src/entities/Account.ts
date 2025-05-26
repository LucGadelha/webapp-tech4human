
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AccountType } from '../constants/AccountType'; // Changed from @/constants/AccountType
import { Transaction } from './Transaction';

@Entity('accounts')
export class Account {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', enum: AccountType })
  type!: AccountType;

  @Column({ type: 'real', default: 0.0 })
  initialBalance!: number;

  @Column({ type: 'real', default: 0.0 })
  currentBalance!: number;

  @OneToMany(() => Transaction, transaction => transaction.sourceAccount)
  outgoingTransactions!: Transaction[];

  @OneToMany(() => Transaction, transaction => transaction.destinationAccount)
  incomingTransactions!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @BeforeInsert()
  initializeCurrentBalance() {
    // currentBalance should be explicitly set, often to initialBalance on creation
    if (typeof this.currentBalance === 'undefined') {
        this.currentBalance = this.initialBalance || 0;
    }
  }
}