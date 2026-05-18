const { getDB } = require('../config/db');
const crypto = require('crypto');

const createAccount = async (req, res) => {
  const { type_compte } = req.body;
  const userId = req.user.id;

  try {
    const db = getDB();
    const numero_compte = crypto.randomInt(1000000000, 9999999999).toString();
    
    const result = await db.run(
      'INSERT INTO COMPTES (id_utilisateur, numero_compte, type_compte, solde, statut) VALUES (?, ?, ?, ?, ?)',
      [userId, numero_compte, type_compte || 'courant', 0.00, 'actif']
    );

    res.status(201).json({
      id_compte: result.lastID,
      id_utilisateur: userId,
      numero_compte: numero_compte,
      type_compte: type_compte || 'courant',
      solde: 0.00,
      statut: 'actif'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur Serveur', error: error.message });
  }
};

const getAccounts = async (req, res) => {
  const userId = req.user.id;

  try {
    const db = getDB();
    const accounts = await db.all('SELECT * FROM COMPTES WHERE id_utilisateur = ?', [userId]);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Erreur Serveur', error: error.message });
  }
};

const getAccountById = async (req, res) => {
  const userId = req.user.id;
  const accountId = req.params.id;

  try {
    const db = getDB();
    const account = await db.get('SELECT * FROM COMPTES WHERE id_compte = ? AND id_utilisateur = ?', [accountId, userId]);
    
    if (!account) {
      return res.status(404).json({ message: 'Compte introuvable' });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Erreur Serveur', error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  const userId = req.user.id;
  const accountId = req.params.id;

  try {
    const db = getDB();
    
    // Check if account exists and belongs to user
    const account = await db.get('SELECT * FROM COMPTES WHERE id_compte = ? AND id_utilisateur = ?', [accountId, userId]);
    
    if (!account) {
      return res.status(404).json({ message: 'Compte introuvable ou non autorisé' });
    }

    // Check if balance is 0 before deleting
    if (parseFloat(account.solde) !== 0) {
      return res.status(400).json({ message: 'Impossible de supprimer un compte avec un solde non nul. Veuillez d\'abord retirer ou transférer tous les fonds.' });
    }

    await db.run('DELETE FROM COMPTES WHERE id_compte = ?', [accountId]);
    
    res.json({ id_compte: accountId, message: 'Compte supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur Serveur', error: error.message });
  }
};

module.exports = { createAccount, getAccounts, getAccountById, deleteAccount };
