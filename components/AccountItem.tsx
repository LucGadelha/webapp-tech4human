import React from 'react';
import { Account } from '../types';
import Button from './Button';

interface AccountItemProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
}

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.243.096 3.288.257m-3.288-.257C3.35 6.128 3 6.462 3 6.828v.022c0 .367.35.704.722.704h16.556c.373 0 .722-.337.722-.704v-.022c0-.366-.35-.703-.722-.703m-16.556 0H8.25m12.091 0H8.25M6.06 13.856L6.006 14.5m9.938 0l.054-.644M11.25 9.75h1.5m-1.5 0a.375.375 0 0 1-.375-.375V8.625c0-.207.168-.375.375-.375h1.5c.207 0 .375.168.375.375v.75a.375.375 0 0 1-.375.375m-1.5 0h.008v.015h-.008V9.75Z" />
  </svg>
);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const AccountItem: React.FC<AccountItemProps> = ({ account, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-blue-700">{account.name}</h3>
          <p className="text-sm text-gray-600">{account.type}</p>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(account)} aria-label="Editar conta">
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(account.id)} aria-label="Excluir conta">
             <TrashIcon className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-xl font-bold text-gray-800">{formatCurrency(account.currentBalance)}</p>
        <p className="text-xs text-gray-500">Saldo Atual</p>
      </div>
       { account.initialBalance !== account.currentBalance && (
         <p className="text-xs text-gray-500 mt-1">Saldo Inicial: {formatCurrency(account.initialBalance)}</p>
       )}
    </div>
  );
};

export default AccountItem;