const { getDB } = require('../config/db');

const performTransaction = async (req, res) => {
  const { account_id, amount, type, to_account_id, description } = req.body;
  const userId = req.user.id;

  if (!account_id || !amount || !type || amount <= 0) {
    return res.status(400).json({ message: 'Détails de transaction invalides' });
  }

  // Normalize transaction type to French database standards
  let typeDb = '';
  if (type === 'deposit' || type === 'depot') {
    typeDb = 'depot';
  } else if (type === 'withdraw' || type === 'retrait') {
    typeDb = 'retrait';
  } else if (type === 'transfer' || type === 'virement') {
    typeDb = 'virement';
  } else {
    return res.status(400).json({ message: 'Type de transaction inconnu' });
  }

  const db = getDB();
  try {
    await db.run('BEGIN TRANSACTION');

    // Verify account ownership
    const account = await db.get('SELECT * FROM COMPTES WHERE id_compte = ? AND id_utilisateur = ?', [account_id, userId]);
    if (!account) {
      await db.run('ROLLBACK');
      return res.status(404).json({ message: 'Compte introuvable ou non autorisé' });
    }

    if (typeDb === 'depot') {
      await db.run('UPDATE COMPTES SET solde = solde + ? WHERE id_compte = ?', [amount, account_id]);
      await db.run(
        'INSERT INTO TRANSACTIONS (compte_destination_id, montant, type_transaction, description, statut) VALUES (?, ?, ?, ?, ?)',
        [account_id, amount, 'depot', description || 'Dépôt', 'valide']
      );
    } else if (typeDb === 'retrait') {
      if (account.solde < amount) {
        await db.run('ROLLBACK');
        return res.status(400).json({ message: 'Solde insuffisant' });
      }
      await db.run('UPDATE COMPTES SET solde = solde - ? WHERE id_compte = ?', [amount, account_id]);
      await db.run(
        'INSERT INTO TRANSACTIONS (compte_source_id, montant, type_transaction, description, statut) VALUES (?, ?, ?, ?, ?)',
        [account_id, amount, 'retrait', description || 'Retrait', 'valide']
      );
    } else if (typeDb === 'virement') {
      if (!to_account_id) {
        await db.run('ROLLBACK');
        return res.status(400).json({ message: 'Compte de destination requis pour le virement' });
      }

      // Find target account (support both account ID and Account Number for maximum flexibility!)
      let targetAccount = await db.get('SELECT * FROM COMPTES WHERE id_compte = ?', [to_account_id]);
      if (!targetAccount) {
        targetAccount = await db.get('SELECT * FROM COMPTES WHERE numero_compte = ?', [to_account_id]);
      }

      if (!targetAccount) {
        await db.run('ROLLBACK');
        return res.status(404).json({ message: 'Compte de destination introuvable' });
      }

      if (account.id_compte === targetAccount.id_compte) {
        await db.run('ROLLBACK');
        return res.status(400).json({ message: 'Impossible de faire un virement vers le même compte' });
      }

      if (account.solde < amount) {
        await db.run('ROLLBACK');
        return res.status(400).json({ message: 'Solde insuffisant pour le virement' });
      }

      await db.run('UPDATE COMPTES SET solde = solde - ? WHERE id_compte = ?', [amount, account_id]);
      await db.run('UPDATE COMPTES SET solde = solde + ? WHERE id_compte = ?', [amount, targetAccount.id_compte]);
      
      await db.run(
        'INSERT INTO TRANSACTIONS (compte_source_id, compte_destination_id, montant, type_transaction, description, statut) VALUES (?, ?, ?, ?, ?, ?)',
        [account_id, targetAccount.id_compte, amount, 'virement', description || 'Virement', 'valide']
      );
    }

    await db.run('COMMIT');
    res.json({ message: 'Transaction effectuée avec succès' });
  } catch (error) {
    await db.run('ROLLBACK');
    res.status(500).json({ message: 'Échec de la transaction', error: error.message });
  }
};

const getTransactionHistory = async (req, res) => {
  const accountId = req.params.accountId;
  const userId = req.user.id;

  try {
    const db = getDB();
    const account = await db.get('SELECT * FROM COMPTES WHERE id_compte = ? AND id_utilisateur = ?', [accountId, userId]);
    if (!account) {
      return res.status(404).json({ message: 'Compte introuvable ou non autorisé' });
    }

    const transactions = await db.all(
      'SELECT * FROM TRANSACTIONS WHERE compte_source_id = ? OR compte_destination_id = ? ORDER BY date_transaction DESC',
      [accountId, accountId]
    );

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur Serveur', error: error.message });
  }
};

module.exports = { performTransaction, getTransactionHistory };
