const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let dbInstance = null;

const initializeDB = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS UTILISATEURS (
      id_utilisateur INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      mot_de_passe TEXT NOT NULL,
      telephone TEXT,
      adresse TEXT,
      role TEXT DEFAULT 'client',
      statut TEXT DEFAULT 'actif',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS COMPTES (
      id_compte INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_compte TEXT NOT NULL UNIQUE,
      type_compte TEXT NOT NULL DEFAULT 'courant',
      solde REAL DEFAULT 0.00,
      statut TEXT DEFAULT 'actif',
      id_utilisateur INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEURS(id_utilisateur) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS TRANSACTIONS (
      id_transaction INTEGER PRIMARY KEY AUTOINCREMENT,
      type_transaction TEXT NOT NULL,
      montant REAL NOT NULL,
      date_transaction DATETIME DEFAULT CURRENT_TIMESTAMP,
      description TEXT,
      statut TEXT DEFAULT 'valide',
      compte_source_id INTEGER,
      compte_destination_id INTEGER,
      FOREIGN KEY (compte_source_id) REFERENCES COMPTES(id_compte) ON DELETE SET NULL,
      FOREIGN KEY (compte_destination_id) REFERENCES COMPTES(id_compte) ON DELETE SET NULL
    );
  `);

  return dbInstance;
};

const getDB = () => {
  if (!dbInstance) {
    throw new Error("Database not initialized");
  }
  return dbInstance;
};

module.exports = { initializeDB, getDB };
