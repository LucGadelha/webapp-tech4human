
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TransactionType } from '../constants/TransactionType'; // Changed from @/constants/TransactionType
import { Account } from './Account'; // No change needed if Account is in the same dir or sub dir relative path is simple

@Entity('transactions')
export class Transaction {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', enum: TransactionType })
  type!: TransactionType;

  @Column({ type: 'real' })
  amount!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'date' }) // Stores YYYY-MM-DD
  date!: string;

  @Column({ type: 'uuid', nullable: true })
  sourceAccountId?: string;

  @ManyToOne(() => Account, account => account.outgoingTransactions, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sourceAccountId' })
  sourceAccount?: Account;

  @Column({ type: 'uuid', nullable: true })
  destinationAccountId?: string;

  @ManyToOne(() => Account, account => account.incomingTransactions, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'destinationAccountId' })
  destinationAccount?: Account;

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
}