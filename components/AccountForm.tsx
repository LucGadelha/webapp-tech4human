import React, { useState, useEffect } from 'react';
import { Account, FormDataAccount } from '../types';
import { AccountType } from '../constants';
import Button from './Button';
import Input from './Input';
import Select from './Select';

interface AccountFormProps {
  onSubmit: (account: FormDataAccount, id?: string) => void;
  onClose: () => void;
  existingAccount?: Account;
}

const AccountForm: React.FC<AccountFormProps> = ({ onSubmit, onClose, existingAccount }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>(AccountType.CORRENTE);
  const [initialBalanceStr, setInitialBalanceStr] = useState<string>('0'); // Store as string
  const [errors, setErrors] = useState<{ name?: string; initialBalance?: string }>({});

  useEffect(() => {
    if (existingAccount) {
      setName(existingAccount.name);
      setType(existingAccount.type);
      setInitialBalanceStr(existingAccount.initialBalance.toString());
    } else {
      // Reset for new account form
      setName('');
      setType(AccountType.CORRENTE);
      setInitialBalanceStr('0');
    }
  }, [existingAccount]);

  const validate = (): boolean => {
    const newErrors: { name?: string; initialBalance?: string } = {};
    if (!name.trim()) newErrors.name = 'Nome da conta é obrigatório.';
    
    const balance = parseFloat(initialBalanceStr);
    if (isNaN(balance) && !existingAccount) { // Check if string is not a valid number for new accounts
        newErrors.initialBalance = 'Saldo inicial deve ser um número.';
    } else if (balance < 0 && !existingAccount) {
        newErrors.initialBalance = 'Saldo inicial não pode ser negativo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const balance = parseFloat(initialBalanceStr);
    // Ensure balance is a number, default to 0 if parsing fails (though validate should catch it for new accounts)
    const numericInitialBalance = isNaN(balance) ? 0 : balance;

    onSubmit({ name, type, initialBalance: numericInitialBalance }, existingAccount?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome da Conta"
        id="accountName"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />
      <Select
        label="Tipo da Conta"
        id="accountType"
        value={type}
        onChange={(e) => setType(e.target.value as AccountType)}
        required
      >
        {Object.values(AccountType).map((accType) => (
          <option key={accType} value={accType}>{accType}</option>
        ))}
      </Select>
      <Input
        label="Saldo Inicial"
        id="initialBalance"
        type="number" // Keeps numeric keyboard on mobile, but value is string
        step="0.01"
        value={initialBalanceStr}
        onChange={(e) => setInitialBalanceStr(e.target.value)}
        error={errors.initialBalance}
        disabled={!!existingAccount} // Saldo inicial não pode ser editado
        required={!existingAccount}
      />
      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {existingAccount ? 'Salvar Alterações' : 'Adicionar Conta'}
        </Button>
      </div>
    </form>
  );
};

export default AccountForm;