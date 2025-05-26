
import React, { useState, useCallback, useEffect } from 'react';
import { Account, Transaction, FormDataAccount, FormDataTransaction } from './types';
import { TransactionType, AccountType } from './constants';
// Removed: import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import Footer from './components/Footer';
import PageContainer from './components/PageContainer';
import Button from './components/Button';
import Modal from './components/Modal';
import AccountForm from './components/AccountForm';
import AccountList from './components/AccountList';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Input from './components/Input';
import Select from './components/Select';

const API_BASE_URL = 'http://localhost:3001/api';

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-2.3.4-3.2 1.1L5.2 8.3C4.5 9.1 4 10.2 4 11.3V12c0 1.1.5 2.1 1.2 2.9L9 19.8c.9.8 2 1.2 3.2 1.2s2.3-.4 3.2-1.2l3.7-3.7c.8-.8 1.2-1.8 1.2-2.9v-.7c0-1.1-.5-2.1-1.2-2.9L15.2 4.1C14.3 3.4 13.2 3 12 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H13.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 22.5H13.5" />
  </svg>
);


const showLoadingSpinner = () => {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'flex';
};

const hideLoadingSpinner = () => {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'none';
};


const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);

  // Filters state
  const [filterAccountId, setFilterAccountId] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const parseErrorResponseMessage = async (response: Response): Promise<string> => {
    let errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // If response is not JSON, try to get text
      try {
        const textError = await response.text();
        if (textError) {
            errorMessage = `${errorMessage} - ${textError}`;
        }
      } catch (textE) {
        // Ignore error trying to get text, stick with original status error
      }
    }
    return errorMessage;
  };

  const fetchAccounts = useCallback(async () => {
    showLoadingSpinner();
    try {
      const response = await fetch(`${API_BASE_URL}/accounts`);
      if (!response.ok) {
        const errorMessage = await parseErrorResponseMessage(response);
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      alert(`Erro ao buscar contas: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      hideLoadingSpinner();
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    showLoadingSpinner();
    const params = new URLSearchParams();
    if (filterAccountId) params.append('accountId', filterAccountId);
    if (filterStartDate) params.append('startDate', filterStartDate);
    if (filterEndDate) params.append('endDate', filterEndDate);
    
    try {
      const response = await fetch(`${API_BASE_URL}/transactions?${params.toString()}`);
      if (!response.ok) {
        const errorMessage = await parseErrorResponseMessage(response);
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      alert(`Erro ao buscar transações: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      hideLoadingSpinner();
    }
  }, [filterAccountId, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);
  
  const handleApplyFilters = () => {
    fetchTransactions();
  };

  // Removed unused handleClearFilters function as its logic is handled by the clear button's onClick directly.

  const handleOpenAccountModal = (account?: Account) => {
    setEditingAccount(account);
    setIsAccountModalOpen(true);
  };

  const handleCloseAccountModal = () => {
    setEditingAccount(undefined);
    setIsAccountModalOpen(false);
  };

  const handleOpenTransactionModal = () => {
    if (accounts.length === 0) {
      alert("Por favor, cadastre uma conta antes de adicionar uma transação.");
      return;
    }
    setIsTransactionModalOpen(true);
  };
  const handleCloseTransactionModal = () => setIsTransactionModalOpen(false);

  const addOrUpdateAccount = useCallback(async (accountData: FormDataAccount, id?: string) => {
    showLoadingSpinner();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/accounts/${id}` : `${API_BASE_URL}/accounts`;
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      });
      if (!response.ok) {
        const errorMessage = await parseErrorResponseMessage(response);
        throw new Error(errorMessage);
      }
      // const savedAccount = await response.json(); // Process response if needed
      fetchAccounts(); // Re-fetch accounts to update list
      handleCloseAccountModal();
    } catch (error) {
      console.error("Failed to save account:", error);
      alert(`Erro ao salvar conta: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      hideLoadingSpinner();
    }
  }, [fetchAccounts]);

  const deleteAccount = useCallback(async (accountId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta? Verifique se não há transações associadas não visíveis devido a filtros.')) {
      showLoadingSpinner();
      try {
        const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorMessage = await parseErrorResponseMessage(response);
          throw new Error(errorMessage);
        }
        fetchAccounts(); 
        fetchTransactions(); 
      } catch (error) {
        console.error("Failed to delete account:", error);
        alert(`Erro ao excluir conta: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        hideLoadingSpinner();
      }
    }
  }, [fetchAccounts, fetchTransactions]);

  const addTransaction = useCallback(async (transactionData: FormDataTransaction) => {
    showLoadingSpinner();
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      if (!response.ok) {
        const errorMessage = await parseErrorResponseMessage(response);
        throw new Error(errorMessage);
      }
      // const newTransaction = await response.json();
      fetchTransactions(); 
      fetchAccounts(); 
      handleCloseTransactionModal();
    } catch (error) {
      console.error("Failed to add transaction:", error);
      alert(`Erro ao adicionar transação: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      hideLoadingSpinner();
    }
  }, [fetchTransactions, fetchAccounts]);
  

  const deleteTransaction = useCallback(async (transactionId: string) => {
     if (!window.confirm('Tem certeza que deseja excluir esta transação? Isso afetará os saldos das contas.')) {
      return;
    }
    showLoadingSpinner();
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, { method: 'DELETE' });
       if (!response.ok) {
        const errorMessage = await parseErrorResponseMessage(response);
        throw new Error(errorMessage);
      }
      fetchTransactions(); 
      fetchAccounts(); 
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert(`Erro ao excluir transação: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      hideLoadingSpinner();
    }
  }, [fetchTransactions, fetchAccounts]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <PageContainer>
        <main className="flex-grow space-y-8">
          {/* Accounts Section */}
          <section className="p-6 bg-white shadow-xl rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Contas Bancárias</h2>
              <Button onClick={() => handleOpenAccountModal()} leftIcon={<PlusIcon className="h-5 w-5"/>}>
                Nova Conta
              </Button>
            </div>
            <AccountList
              accounts={accounts}
              onEditAccount={handleOpenAccountModal}
              onDeleteAccount={deleteAccount}
            />
          </section>

          {/* Transactions Section */}
          <section className="p-6 bg-white shadow-xl rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Transações Financeiras</h2>
              <div className="flex space-x-2">
                <Button onClick={() => setShowFilters(!showFilters)} variant="ghost" size="sm" leftIcon={<FilterIcon className="h-5 w-5"/>}>
                  {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </Button>
                <Button 
                  onClick={handleOpenTransactionModal} 
                  disabled={accounts.length === 0}
                  leftIcon={<PlusIcon className="h-5 w-5"/>}
                >
                  Nova Transação
                </Button>
              </div>
            </div>
            
            {showFilters && (
              <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4 md:space-y-0 md:flex md:space-x-4 md:items-end">
                <div className="flex-1 min-w-0">
                  <Select
                    label="Filtrar por Conta"
                    id="filterAccount"
                    value={filterAccountId}
                    onChange={(e) => setFilterAccountId(e.target.value)}
                    className="text-gray-700 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500" /* Overriding dark input for filter section */
                  >
                    <option value="">Todas as Contas</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </Select>
                </div>
                <div className="flex-1 min-w-0">
                   <Input
                    label="Data Início"
                    id="filterStartDate"
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="text-gray-700 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500" /* Overriding dark input */
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    label="Data Fim"
                    id="filterEndDate"
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="text-gray-700 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500" /* Overriding dark input */
                  />
                </div>
                <div className="flex space-x-2 pt-4 md:pt-0">
                    <Button onClick={handleApplyFilters} size="md">Aplicar</Button>
                    <Button onClick={() => {setFilterAccountId(''); setFilterStartDate(''); setFilterEndDate(''); handleApplyFilters();}} variant="secondary" size="md">Limpar</Button>
                </div>
              </div>
            )}

            <TransactionList
              transactions={transactions}
              accounts={accounts}
              onDeleteTransaction={deleteTransaction}
            />
          </section>
        </main>
      </PageContainer>
      <Footer />

      {/* Modals */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={handleCloseAccountModal}
        title={editingAccount ? 'Editar Conta' : 'Adicionar Nova Conta'}
      >
        <AccountForm
          onSubmit={addOrUpdateAccount}
          onClose={handleCloseAccountModal}
          existingAccount={editingAccount}
        />
      </Modal>

      <Modal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        title="Registrar Nova Transação"
      >
        <TransactionForm
          onSubmit={addTransaction}
          onClose={handleCloseTransactionModal}
          accounts={accounts}
        />
      </Modal>
    </div>
  );
};

export default App;
    