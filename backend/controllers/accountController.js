const { getDB } = require('../config/db');
const crypto = require('crypto');

const createAccount = async (req, res) => {
  const { account_type } = req.body;
  const userId = req.user.id;

  try {
    const db = getDB();
    const accountNumber = crypto.randomInt(1000000000, 9999999999).toString();
    
    const result = await db.run(
      'INSERT INTO accounts (user_id, account_number, account_type, balance) VALUES (?, ?, ?, ?)',
      [userId, accountNumber, account_type || 'checking', 0.00]
    );

    res.status(201).json({
      id: result.lastID,
      user_id: userId,
      account_number: accountNumber,
      account_type: account_type || 'checking',
      balance: 0.00
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAccounts = async (req, res) => {
  const userId = req.user.id;

  try {
    const db = getDB();
    const accounts = await db.all('SELECT * FROM accounts WHERE user_id = ?', [userId]);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAccountById = async (req, res) => {
  const userId = req.user.id;
  const accountId = req.params.id;

  try {
    const db = getDB();
    const account = await db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, userId]);
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  const userId = req.user.id;
  const accountId = req.params.id;

  try {
    const db = getDB();
    
    // Check if account exists and belongs to user
    const account = await db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, userId]);
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found or unauthorized' });
    }

    // Optional: check if balance is 0 before deleting. Some banks require this.
    if (parseFloat(account.balance) !== 0) {
      return res.status(400).json({ message: 'Cannot delete account with a non-zero balance. Please transfer or withdraw all funds first.' });
    }

    await db.run('DELETE FROM accounts WHERE id = ?', [accountId]);
    
    res.json({ id: accountId, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createAccount, getAccounts, getAccountById, deleteAccount };
