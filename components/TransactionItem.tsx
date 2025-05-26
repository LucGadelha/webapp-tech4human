import React from 'react';
import { Transaction, Account } from '../types';
import { TransactionType } from '../constants';
import Button from './Button';

interface TransactionItemProps {
  transaction: Transaction;
  accounts: Account[];
  onDelete: (transactionId: string) => void;
}

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
     <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.243.096 3.288.257m-3.288-.257C3.35 6.128 3 6.462 3 6.828v.022c0 .367.35.704.722.704h16.556c.373 0 .722-.337.722-.704v-.022c0-.366-.35-.703-.722-.703m-16.556 0H8.25m12.091 0H8.25M6.06 13.856L6.006 14.5m9.938 0l.054-.644M11.25 9.75h1.5m-1.5 0a.375.375 0 0 1-.375-.375V8.625c0-.207.168-.375.375-.375h1.5c.207 0 .375.168.375.375v.75a.375.375 0 0 1-.375.375m-1.5 0h.008v.015h-.008V9.75Z" />
   </svg>
 );

const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);


const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string) => {
  // Assuming dateString is YYYY-MM-DD from backend or input
  const [year, month, day] = dateString.split('-').map(Number);
  // JavaScript Date months are 0-indexed
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};


const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, accounts, onDelete }) => {
  const getAccountName = (accountId?: string) => {
    if (!accountId) return 'N/A';
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Conta Desconhecida';
  };

  const transactionTypeColor = {
    [TransactionType.CREDITO]: 'text-green-600',
    [TransactionType.DEBITO]: 'text-red-600',
    [TransactionType.TRANSFERENCIA]: 'text-blue-600',
  };

  return (
    <tr className="bg-white hover:bg-gray-100 hover:shadow-sm transition-all duration-300 ease-in-out">
      <td className={`px-4 py-3 text-sm font-medium ${transactionTypeColor[transaction.type]}`}>{transaction.type}</td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {transaction.type === TransactionType.DEBITO && `De: ${getAccountName(transaction.sourceAccountId)}`}
        {transaction.type === TransactionType.CREDITO && `Para: ${getAccountName(transaction.destinationAccountId)}`}
        {transaction.type === TransactionType.TRANSFERENCIA && (
          <div className="flex items-center space-x-1">
            <span>{getAccountName(transaction.sourceAccountId)}</span>
            <ArrowRightIcon className="h-4 w-4 text-gray-400" />
            <span>{getAccountName(transaction.destinationAccountId)}</span>
          </div>
        )}
      </td>
      <td className={`px-4 py-3 text-sm font-semibold ${transaction.type === TransactionType.CREDITO ? 'text-green-700' : 'text-red-700'}`}>
        {transaction.type === TransactionType.CREDITO ? '+' : '-'}{formatCurrency(transaction.amount)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={transaction.description}>{transaction.description || '-'}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(transaction.date)}</td>
      <td className="px-4 py-3 text-sm text-right">
        <Button size="sm" variant="ghost" onClick={() => onDelete(transaction.id)} aria-label="Excluir transação">
          <TrashIcon className="h-4 w-4 text-red-500" />
        </Button>
      </td>
    </tr>
  );
};

export default TransactionItem;