import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAccounts, createAccount, fetchTransactions, performTransaction, deleteAccount, resetState } from '../slices/accountSlice';
import { toast } from 'react-toastify';
import { PlusCircle, Send, ArrowDownToLine, ArrowUpFromLine, RefreshCw, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { accountsList, currentTransactions, isError, message, isSuccess } = useSelector((state) => state.accounts);
  
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactionData, setTransactionData] = useState({ type: 'deposit', amount: '', to_account_id: '', description: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(fetchAccounts());
    }
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(resetState());
    }
    if (isSuccess && transactionData.amount) {
      toast.success('Transaction Successful');
      dispatch(fetchAccounts());
      if (selectedAccount) dispatch(fetchTransactions(selectedAccount.id));
      setTransactionData({ type: 'deposit', amount: '', to_account_id: '', description: '' });
      dispatch(resetState());
    }
  }, [isError, message, isSuccess, transactionData.amount, dispatch, selectedAccount]);

  const handleCreateAccount = () => {
    dispatch(createAccount({ account_type: 'checking' }));
  };

  const handleDeleteAccount = () => {
    if (!selectedAccount) return;
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      dispatch(deleteAccount(selectedAccount.id)).then((res) => {
        if (!res.error) {
          toast.success('Account deleted successfully');
          setSelectedAccount(null);
        }
      });
    }
  };

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    dispatch(fetchTransactions(account.id));
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    if (!selectedAccount) return toast.error('Select an account first');
    dispatch(performTransaction({
      account_id: selectedAccount.id,
      amount: parseFloat(transactionData.amount),
      type: transactionData.type,
      to_account_id: transactionData.type === 'transfer' ? transactionData.to_account_id : null,
      description: transactionData.description
    }));
  };

  return (
    <div className="container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="gradient-text" style={{ fontSize: '32px' }}>Dashboard</h2>
        <button className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleCreateAccount}>
          <PlusCircle size={20} /> New Account
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="accounts-section">
          <h3 style={{ marginBottom: '16px' }}>Your Accounts</h3>
          {accountsList.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No accounts found. Create one to get started.</p>
          ) : (
            accountsList.map(account => (
              <div 
                key={account.id} 
                className={`account-card glass-panel ${selectedAccount?.id === account.id ? 'active' : ''}`}
                style={{ 
                  cursor: 'pointer', 
                  border: selectedAccount?.id === account.id ? '1px solid var(--accent-primary)' : '' 
                }}
                onClick={() => handleSelectAccount(account)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span style={{ textTransform: 'capitalize' }}>{account.account_type}</span>
                  <span>#{account.account_number}</span>
                </div>
                <div className="balance-large gradient-text">${parseFloat(account.balance).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>

        <div className="transactions-section glass-panel" style={{ padding: '24px' }}>
          {selectedAccount ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3>Perform Transaction</h3>
                <button 
                  onClick={handleDeleteAccount}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Trash2 size={18} /> Delete Account
                </button>
              </div>
              <form onSubmit={handleTransactionSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                <select 
                  className="input-field" 
                  style={{ gridColumn: 'span 2' }}
                  value={transactionData.type} 
                  onChange={(e) => setTransactionData({...transactionData, type: e.target.value})}
                >
                  <option value="deposit">Deposit</option>
                  <option value="withdraw">Withdraw</option>
                  <option value="transfer">Transfer</option>
                </select>
                
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Amount" 
                  className="input-field" 
                  value={transactionData.amount} 
                  onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                  required 
                />
                
                {transactionData.type === 'transfer' && (
                  <input 
                    type="text" 
                    placeholder="Target Account ID" 
                    className="input-field" 
                    value={transactionData.to_account_id} 
                    onChange={(e) => setTransactionData({...transactionData, to_account_id: e.target.value})}
                    required 
                  />
                )}
                
                <input 
                  type="text" 
                  placeholder="Description (Optional)" 
                  className="input-field" 
                  style={{ gridColumn: transactionData.type === 'transfer' ? 'span 2' : 'span 1' }}
                  value={transactionData.description} 
                  onChange={(e) => setTransactionData({...transactionData, description: e.target.value})}
                />
                
                <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  {transactionData.type === 'deposit' && <ArrowDownToLine size={20} />}
                  {transactionData.type === 'withdraw' && <ArrowUpFromLine size={20} />}
                  {transactionData.type === 'transfer' && <Send size={20} />}
                  Submit Transaction
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3>Recent Transactions</h3>
                <button className="btn-secondary" style={{ padding: '6px 12px', width: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }} onClick={() => dispatch(fetchTransactions(selectedAccount.id))}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
              
              <ul className="transaction-list">
                {currentTransactions.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No transactions yet.</p>
                ) : (
                  currentTransactions.map(tx => (
                    <li key={tx.id} className="transaction-item">
                      <div>
                        <p style={{ fontWeight: '500', textTransform: 'capitalize' }}>{tx.transaction_type} {tx.description && `- ${tx.description}`}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(tx.created_at).toLocaleString()}</p>
                      </div>
                      <div className={`balance-large ${tx.transaction_type === 'deposit' || tx.to_account_id === selectedAccount.id ? 'text-success' : 'text-danger'}`} style={{ fontSize: '18px', margin: 0 }}>
                        {tx.transaction_type === 'deposit' || tx.to_account_id === selectedAccount.id ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Select an account to view details and perform transactions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
