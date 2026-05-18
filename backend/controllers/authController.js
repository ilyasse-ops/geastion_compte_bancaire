const { getDB } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  const { nom, prenom, email, password, telephone, adresse } = req.body;

  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires (nom, prénom, email, mot de passe)' });
  }

  try {
    const db = getDB();
    const existingUser = await db.get('SELECT * FROM UTILISATEURS WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.run(
      'INSERT INTO UTILISATEURS (nom, prenom, email, mot_de_passe, telephone, adresse) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, telephone || null, adresse || null]
    );

    if (result.lastID) {
      res.status(201).json({
        id_utilisateur: result.lastID,
        nom,
        prenom,
        email,
        telephone: telephone || null,
        adresse: adresse || null,
        role: 'client',
        statut: 'actif',
        token: generateToken(result.lastID),
      });
    } else {
      res.status(400).json({ message: 'Données utilisateur invalides' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur Serveur', error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = getDB();
    const user = await db.get('SELECT * FROM UTILISATEURS WHERE email = ?', [email]);
    
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    const isMatch = await bcrypt.compare(password, user.mot_de_passe);

    if (isMatch) {
      res.json({
        id_utilisateur: user.id_utilisateur,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        adresse: user.adresse,
        role: user.role,
        statut: user.statut,
        token: generateToken(user.id_utilisateur),
      });
    } else {
      res.status(400).json({ message: 'Identifiants invalides' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur Serveur', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const db = getDB();
    const user = await db.get(
      'SELECT id_utilisateur, nom, prenom, email, telephone, adresse, role, statut, created_at FROM UTILISATEURS WHERE id_utilisateur = ?',
      [req.user.id]
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur Serveur', error: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
