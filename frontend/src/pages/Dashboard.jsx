import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAccounts, createAccount, fetchTransactions, performTransaction, deleteAccount, resetState } from '../slices/accountSlice';
import { toast } from 'react-toastify';
import { PlusCircle, Send, ArrowDownToLine, ArrowUpFromLine, RefreshCw, Trash2, ShieldCheck, Vault } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { accountsList, currentTransactions, isError, message, isSuccess } = useSelector((state) => state.accounts);
  
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newAccountType, setNewAccountType] = useState('courant');
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
      toast.success('Transaction effectuée avec succès');
      dispatch(fetchAccounts());
      if (selectedAccount) dispatch(fetchTransactions(selectedAccount.id_compte));
      setTransactionData({ type: 'deposit', amount: '', to_account_id: '', description: '' });
      dispatch(resetState());
    }
  }, [isError, message, isSuccess, transactionData.amount, dispatch, selectedAccount]);

  // Keep selectedAccount's local state updated with latest data from accountsList
  useEffect(() => {
    if (selectedAccount && accountsList.length > 0) {
      const updated = accountsList.find(acc => acc.id_compte === selectedAccount.id_compte);
      if (updated) {
        setSelectedAccount(updated);
      }
    }
  }, [accountsList, selectedAccount]);

  const handleCreateAccount = () => {
    dispatch(createAccount({ type_compte: newAccountType })).then((res) => {
      if (!res.error) {
        toast.success(`Compte ${newAccountType} créé avec succès`);
        dispatch(fetchAccounts());
      }
    });
  };

  const handleDeleteAccount = () => {
    if (!selectedAccount) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.')) {
      dispatch(deleteAccount(selectedAccount.id_compte)).then((res) => {
        if (!res.error) {
          toast.success('Compte supprimé avec succès');
          setSelectedAccount(null);
        }
      });
    }
  };

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    dispatch(fetchTransactions(account.id_compte));
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    if (!selectedAccount) return toast.error('Veuillez d\'abord sélectionner un compte');
    dispatch(performTransaction({
      account_id: selectedAccount.id_compte,
      amount: parseFloat(transactionData.amount),
      type: transactionData.type,
      to_account_id: transactionData.type === 'transfer' ? transactionData.to_account_id : null,
      description: transactionData.description
    }));
  };

  return (
    <div className="container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="gradient-text" style={{ fontSize: '32px', margin: 0 }}>Tableau de Bord</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Bonjour, <strong style={{ color: 'var(--accent-primary)' }}>{user?.prenom} {user?.nom}</strong>. Bienvenue chez Vaultia.
          </p>
        </div>
        
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px' }}>
          <select 
            className="input-field" 
            style={{ width: '160px', margin: 0, padding: '8px 12px', fontSize: '14px' }}
            value={newAccountType}
            onChange={(e) => setNewAccountType(e.target.value)}
          >
            <option value="courant">Compte Courant</option>
            <option value="epargne">Compte Épargne</option>
          </select>
          <button className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '14px' }} onClick={handleCreateAccount}>
            <PlusCircle size={18} /> Nouveau Compte
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="accounts-section">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Vault size={20} color="var(--accent-primary)" /> Vos Comptes Bancaires
          </h3>
          {accountsList.length === 0 ? (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Aucun compte trouvé. Créez-en un pour commencer.</p>
            </div>
          ) : (
            accountsList.map(account => (
              <div 
                key={account.id_compte} 
                className={`account-card glass-panel ${selectedAccount?.id_compte === account.id_compte ? 'active' : ''}`}
                style={{ 
                  cursor: 'pointer', 
                  border: selectedAccount?.id_compte === account.id_compte ? '2px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => handleSelectAccount(account)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: '600', color: 'var(--accent-secondary)' }}>
                    Compte {account.type_compte === 'checking' || account.type_compte === 'courant' ? 'Courant' : 'Épargne'}
                  </span>
                  <span>N° {account.numero_compte}</span>
                </div>
                <div className="balance-large gradient-text" style={{ margin: '12px 0 4px 0' }}>
                  {parseFloat(account.solde).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '8px' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '20px', 
                    background: account.statut === 'actif' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 23, 68, 0.15)',
                    color: account.statut === 'actif' ? '#00e676' : '#ff1744',
                    fontWeight: '600'
                  }}>
                    {account.statut}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>ID Unique: {account.id_compte}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="transactions-section glass-panel" style={{ padding: '24px' }}>
          {selectedAccount ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0 }}>Gérer le Compte N° {selectedAccount.numero_compte}</h3>
                <button 
                  onClick={handleDeleteAccount}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}
                >
                  <Trash2 size={18} /> Clôturer le Compte
                </button>
              </div>

              <form onSubmit={handleTransactionSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>Type d'Opération</label>
                  <select 
                    className="input-field" 
                    style={{ margin: 0 }}
                    value={transactionData.type} 
                    onChange={(e) => setTransactionData({...transactionData, type: e.target.value})}
                  >
                    <option value="deposit">Dépôt (Dépôt d'espèces)</option>
                    <option value="withdraw">Retrait (Retrait d'espèces)</option>
                    <option value="transfer">Virement (Virement vers un autre compte)</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>Montant (€)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Ex: 150.00" 
                    className="input-field" 
                    style={{ margin: 0 }}
                    value={transactionData.amount} 
                    onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                    required 
                  />
                </div>
                
                {transactionData.type === 'transfer' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>Compte Bénéficiaire (ID ou N° de compte)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 8527493015" 
                      className="input-field" 
                      style={{ margin: 0 }}
                      value={transactionData.to_account_id} 
                      onChange={(e) => setTransactionData({...transactionData, to_account_id: e.target.value})}
                      required 
                    />
                  </div>
                )}
                
                <div style={{ gridColumn: transactionData.type === 'transfer' ? 'span 2' : 'span 1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>Description / Motif (Optionnel)</label>
                  <input 
                    type="text" 
                    placeholder="Motif de la transaction" 
                    className="input-field" 
                    style={{ margin: 0 }}
                    value={transactionData.description} 
                    onChange={(e) => setTransactionData({...transactionData, description: e.target.value})}
                  />
                </div>
                
                <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  {transactionData.type === 'deposit' && <ArrowDownToLine size={20} />}
                  {transactionData.type === 'withdraw' && <ArrowUpFromLine size={20} />}
                  {transactionData.type === 'transfer' && <Send size={20} />}
                  Valider la Transaction
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Historique des Transactions</h3>
                <button className="btn-secondary" style={{ padding: '6px 12px', width: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }} onClick={() => dispatch(fetchTransactions(selectedAccount.id_compte))}>
                  <RefreshCw size={14} /> Rafraîchir
                </button>
              </div>
              
              <ul className="transaction-list">
                {currentTransactions.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderStyle: 'dashed' }}>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Aucune transaction effectuée sur ce compte.</p>
                  </div>
                ) : (
                  currentTransactions.map(tx => {
                    const isCredit = tx.type_transaction === 'depot' || (tx.type_transaction === 'virement' && tx.compte_destination_id === selectedAccount.id_compte);
                    return (
                      <li key={tx.id_transaction} className="transaction-item">
                        <div>
                          <p style={{ fontWeight: '600', textTransform: 'capitalize', margin: 0 }}>
                            {tx.type_transaction === 'depot' ? 'Dépôt' : tx.type_transaction === 'retrait' ? 'Retrait' : 'Virement'}
                            {tx.description && <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)', fontSize: '14px' }}> - {tx.description}</span>}
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                            {new Date(tx.date_transaction).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <div className={`balance-large ${isCredit ? 'text-success' : 'text-danger'}`} style={{ fontSize: '18px', margin: 0, fontWeight: '700' }}>
                          {isCredit ? '+' : '-'}{parseFloat(tx.montant).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '40px', textAlign: 'center', gap: '16px' }}>
              <ShieldCheck size={48} color="var(--accent-primary)" style={{ opacity: 0.7 }} />
              <div>
                <p style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>Vaultia Services Sécurisés</p>
                <p style={{ margin: 0 }}>Veuillez sélectionner un compte bancaire dans le panneau de gauche pour consulter le solde, exécuter des opérations et visualiser l'historique des transactions.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
