import React, { useState, useEffect } from 'react';
import { Account, Transaction, FormDataTransaction } from '../types';
import { TransactionType } from '../constants';
import Button from './Button';
import Input from './Input';
import Select from './Select';

interface TransactionFormProps {
  onSubmit: (transaction: FormDataTransaction) => void;
  onClose: () => void;
  accounts: Account[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onClose, accounts }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.DEBITO);
  const [sourceAccountId, setSourceAccountId] = useState<string>('');
  const [destinationAccountId, setDestinationAccountId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('0'); // Store as string
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [errors, setErrors] = useState<Partial<Record<keyof FormDataTransaction | 'general', string>>>({});

  useEffect(() => {
    // Reset account selections and errors when type changes or accounts list changes
    setSourceAccountId('');
    setDestinationAccountId('');
    setErrors({});
    
    // Auto-select first available account based on type
    if (accounts.length > 0) {
        if (type === TransactionType.DEBITO || type === TransactionType.TRANSFERENCIA) {
            setSourceAccountId(accounts[0].id);
            if (type === TransactionType.TRANSFERENCIA && accounts.length > 1) {
                // Try to select a different account for destination
                setDestinationAccountId(accounts[1].id);
            } else if (type === TransactionType.TRANSFERENCIA && accounts.length === 1) {
                 // If only one account, still set it, validation will catch it
                setDestinationAccountId(accounts[0].id);
            }
        } else if (type === TransactionType.CREDITO) {
            setDestinationAccountId(accounts[0].id);
        }
    }
  }, [type, accounts]);
  
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormDataTransaction | 'general', string>> = {};
    const numericAmount = parseFloat(amountStr);

    if (isNaN(numericAmount) || numericAmount <= 0) newErrors.amount = 'Valor deve ser um número positivo.';
    if (!date) newErrors.date = 'Data é obrigatória.';

    const sourceAccount = accounts.find(acc => acc.id === sourceAccountId);
    // const destinationAccount = accounts.find(acc => acc.id === destinationAccountId); // Not needed for balance check here

    if (type === TransactionType.DEBITO) {
      if (!sourceAccountId) newErrors.sourceAccountId = 'Conta de origem é obrigatória.';
      else if (sourceAccount && sourceAccount.currentBalance < numericAmount) newErrors.general = 'Saldo insuficiente na conta de origem.';
    } else if (type === TransactionType.CREDITO) {
      if (!destinationAccountId) newErrors.destinationAccountId = 'Conta de destino é obrigatória.';
    } else if (type === TransactionType.TRANSFERENCIA) {
      if (!sourceAccountId) newErrors.sourceAccountId = 'Conta de origem é obrigatória.';
      if (!destinationAccountId) newErrors.destinationAccountId = 'Conta de destino é obrigatória.';
      if (sourceAccountId && destinationAccountId && sourceAccountId === destinationAccountId) {
        newErrors.general = 'Conta de origem e destino não podem ser a mesma.';
      }
      if (sourceAccount && sourceAccount.currentBalance < numericAmount) {
        newErrors.general = (newErrors.general ? newErrors.general + " " : "") + 'Saldo insuficiente na conta de origem.';
      }
       if (accounts.length < 2 && sourceAccountId && destinationAccountId && sourceAccountId !== destinationAccountId ) {
           // This case should be fine if accounts are different, main check for transfer is 2+ accounts if different selected
       } else if (accounts.length < 2 && sourceAccountId === destinationAccountId) {
           newErrors.general = (newErrors.general ? newErrors.general + " " : "") + 'São necessárias pelo menos duas contas distintas para transferência.';
       } else if (accounts.length < 1) {
            newErrors.general = 'Nenhuma conta disponível para transferência.';
       }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const numericAmount = parseFloat(amountStr) || 0;

    const transactionData: FormDataTransaction = {
      type,
      amount: numericAmount,
      description: description.trim() || undefined,
      date,
    };

    if (type === TransactionType.DEBITO || type === TransactionType.TRANSFERENCIA) {
      transactionData.sourceAccountId = sourceAccountId;
    }
    if (type === TransactionType.CREDITO || type === TransactionType.TRANSFERENCIA) {
      transactionData.destinationAccountId = destinationAccountId;
    }
    onSubmit(transactionData);
  };
  
  const availableSourceAccounts = accounts;
  const availableDestinationAccounts = type === TransactionType.TRANSFERENCIA 
    ? accounts.filter(acc => acc.id !== sourceAccountId)
    : accounts;


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{errors.general}</p>}
      <Select
        label="Tipo da Transação"
        id="transactionType"
        value={type}
        onChange={(e) => setType(e.target.value as TransactionType)}
        required
      >
        {Object.values(TransactionType).map((transType) => (
          <option key={transType} value={transType}>{transType}</option>
        ))}
      </Select>

      {(type === TransactionType.DEBITO || type === TransactionType.TRANSFERENCIA) && (
        <Select
          label="Conta de Origem"
          id="sourceAccount"
          value={sourceAccountId}
          onChange={(e) => setSourceAccountId(e.target.value)}
          error={errors.sourceAccountId}
          required
          disabled={availableSourceAccounts.length === 0}
        >
          <option value="">Selecione a conta de origem</option>
          {availableSourceAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
        </Select>
      )}

      {(type === TransactionType.CREDITO || type === TransactionType.TRANSFERENCIA) && (
        <Select
          label="Conta de Destino"
          id="destinationAccount"
          value={destinationAccountId}
          onChange={(e) => setDestinationAccountId(e.target.value)}
          error={errors.destinationAccountId}
          required
          disabled={availableDestinationAccounts.length === 0}
        >
          <option value="">Selecione a conta de destino</option>
          {availableDestinationAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
        </Select>
      )}

      <Input
        label="Valor"
        id="amount"
        type="number" // Keeps numeric keyboard, value is string
        min="0.01" // Browser validation hint
        step="0.01"
        value={amountStr}
        onChange={(e) => setAmountStr(e.target.value)}
        error={errors.amount}
        required
      />
      <Input
        label="Descrição (Opcional)"
        id="description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        label="Data da Transação"
        id="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
        required
      />

      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
            type="submit" 
            disabled={
                (type === TransactionType.DEBITO && availableSourceAccounts.length === 0) ||
                (type === TransactionType.CREDITO && availableDestinationAccounts.length === 0) ||
                (type === TransactionType.TRANSFERENCIA && (availableSourceAccounts.length === 0 || availableDestinationAccounts.length === 0 || accounts.length < 2 ))
            }
        >
          Adicionar Transação
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;