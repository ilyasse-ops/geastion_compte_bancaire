const { getDB } = require('../config/db');

const performTransaction = async (req, res) => {
  const { account_id, amount, type, to_account_id, description } = req.body;
  const userId = req.user.id;

  if (!account_id || !amount || !type || amount <= 0) {
    return res.status(400).json({ message: 'Invalid transaction details' });
  }

  const db = getDB();
  try {
    await db.run('BEGIN TRANSACTION');

    // Verify account ownership
    const account = await db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [account_id, userId]);
    if (!account) {
      await db.run('ROLLBACK');
      return res.status(404).json({ message: 'Account not found or unauthorized' });
    }

    if (type === 'deposit') {
      await db.run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, account_id]);
      await db.run(
        'INSERT INTO transactions (to_account_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)',
        [account_id, amount, 'deposit', description || 'Deposit']
      );
    } else if (type === 'withdraw') {
      if (account.balance < amount) {
        await db.run('ROLLBACK');
        return res.status(400).json({ message: 'Insufficient funds' });
      }
      await db.run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, account_id]);
      await db.run(
        'INSERT INTO transactions (from_account_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)',
        [account_id, amount, 'withdraw', description || 'Withdrawal']
      );
    } else if (type === 'transfer') {
      if (!to_account_id) {
        await db.run('ROLLBACK');
        return res.status(400).json({ message: 'Target account required for transfer' });
      }
      if (account_id === to_account_id) {
        await db.run('ROLLBACK');
        return res.status(400).json({ message: 'Cannot transfer to the same account' });
      }

      if (account.balance < amount) {
        await db.run('ROLLBACK');
        return res.status(400).json({ message: 'Insufficient funds for transfer' });
      }

      const targetAccount = await db.get('SELECT * FROM accounts WHERE id = ?', [to_account_id]);
      if (!targetAccount) {
        await db.run('ROLLBACK');
        return res.status(404).json({ message: 'Target account not found' });
      }

      await db.run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, account_id]);
      await db.run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, to_account_id]);
      
      await db.run(
        'INSERT INTO transactions (from_account_id, to_account_id, amount, transaction_type, description) VALUES (?, ?, ?, ?, ?)',
        [account_id, to_account_id, amount, 'transfer', description || 'Transfer']
      );
    } else {
      await db.run('ROLLBACK');
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    await db.run('COMMIT');
    res.json({ message: 'Transaction successful' });
  } catch (error) {
    await db.run('ROLLBACK');
    res.status(500).json({ message: 'Transaction failed', error: error.message });
  }
};

const getTransactionHistory = async (req, res) => {
  const accountId = req.params.accountId;
  const userId = req.user.id;

  try {
    const db = getDB();
    const account = await db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, userId]);
    if (!account) {
      return res.status(404).json({ message: 'Account not found or unauthorized' });
    }

    const transactions = await db.all(
      'SELECT * FROM transactions WHERE from_account_id = ? OR to_account_id = ? ORDER BY created_at DESC',
      [accountId, accountId]
    );

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { performTransaction, getTransactionHistory };
