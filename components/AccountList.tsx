
import React from 'react';
import { Account } from '../types';
import AccountItem from './AccountItem';

interface AccountListProps {
  accounts: Account[];
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
}

const AccountList: React.FC<AccountListProps> = ({ accounts, onEditAccount, onDeleteAccount }) => {
  if (accounts.length === 0) {
    return <p className="text-gray-600 text-center py-4">Nenhuma conta cadastrada ainda.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <AccountItem
          key={account.id}
          account={account}
          onEdit={onEditAccount}
          onDelete={onDeleteAccount}
        />
      ))}
    </div>
  );
};

export default AccountList;
