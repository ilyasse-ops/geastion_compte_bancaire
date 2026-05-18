# Système Sécurisé de Gestion de Comptes Bancaires - Vaultia

Vaultia est une application web full-stack de services financiers numériques conçue pour permettre une gestion intuitive, sécurisée et en temps réel de comptes bancaires. L'application est entièrement alignée sur le cahier des charges avec un schéma relationnel, des APIs et des interfaces utilisateur localisés en français.

## 🚀 Fonctionnalités Clés

- **Authentification Sécurisée (JWT) :** Inscription et connexion sécurisées. L'inscription prend en charge le profil utilisateur complet (`nom`, `prénom`, `téléphone`, `adresse`).
- **Gestion des Comptes (Multi-Comptes) :** Création et gestion de comptes bancaires avec choix du type de compte :
  - **Compte Courant**
  - **Compte Épargne**
- **Transactions Bancaires Atomiques :** Exécution sécurisée des opérations bancaires standards :
  - **Dépôt** (Dépôt d'espèces)
  - **Retrait** (Retrait d'espèces avec vérification automatique du solde)
  - **Virement** (Virement de compte à compte avec recherche flexible par identifiant ou numéro de compte)
- **Historique des Transactions :** Journalisation détaillée de toutes les opérations avec date, motif/description, montant et type d'opération.
- **Interface Premium Dark Mode :** Design d'avant-garde avec verre dépoli (glassmorphic panels), dégradés subtils, micro-animations en CSS et icônes modernes basées sur Lucide React.
- **Sécurisation & ACID :** Intégrité des données absolue grâce à des transactions SQLite transactionnelles (`BEGIN`, `COMMIT`, `ROLLBACK`) pour éviter toute race-condition sur les virements.

---

## 🛠️ Stack Technique

* **Frontend :** React.js (Vite), Redux Toolkit (gestion d'état globale asynchrone), React Router v7, Axios, React-Toastify, Lucide React, CSS Vanille.
* **Backend :** Node.js, Express.js, SQLite (via le module `sqlite3`/`sqlite`), JSON Web Tokens (JWT), Bcrypt (hachage cryptographique des mots de passe).
* **Base de données :** SQLite (base embarquée, aucune installation requise en local).

---

## 📊 Modèle de Données (Base de Données)

Le schéma relationnel est structuré en français pour une parfaite adéquation avec le métier :

```mermaid
erDiagram
    UTILISATEURS {
        int id_utilisateur PK
        string nom
        string prenom
        string email UNIQUE
        string mot_de_passe
        string telephone
        string adresse
        string role
        string statut
    }
    COMPTES {
        int id_compte PK
        string numero_compte UNIQUE
        string type_compte
        real solde
        string statut
        int id_utilisateur FK
    }
    TRANSACTIONS {
        int id_transaction PK
        string type_transaction
        real montant
        datetime date_transaction
        string description
        string statut
        int compte_source_id FK
        int compte_destination_id FK
    }
    UTILISATEURS ||--o{ COMPTES : "possède"
    COMPTES ||--o{ TRANSACTIONS : "débite"
    COMPTES ||--o{ TRANSACTIONS : "crédite"
```

### Description des Tables

#### 1. Table `UTILISATEURS`
Stocke les profils des utilisateurs de la banque.
* `id_utilisateur` (INTEGER PRIMARY KEY AUTOINCREMENT)
* `nom` / `prenom` (TEXT, requis)
* `email` (TEXT, unique, requis)
* `mot_de_passe` (TEXT, haché par Bcrypt, requis)
* `telephone` / `adresse` (TEXT, facultatifs)
* `role` (TEXT, par défaut `'client'`)
* `statut` (TEXT, par défaut `'actif'`)

#### 2. Table `COMPTES`
Stocke les comptes courants et d'épargne associés à un utilisateur.
* `id_compte` (INTEGER PRIMARY KEY AUTOINCREMENT)
* `numero_compte` (TEXT, unique, requis) - Généré aléatoirement sur 10 chiffres.
* `type_compte` (TEXT, par défaut `'courant'`) - Valeurs autorisées : `'courant'`, `'epargne'`.
* `solde` (REAL, par défaut `0.00`)
* `statut` (TEXT, par défaut `'actif'`)
* `id_utilisateur` (INTEGER FK, référence `UTILISATEURS(id_utilisateur)`)

#### 3. Table `TRANSACTIONS`
Enregistre l'ensemble des flux financiers de l'application.
* `id_transaction` (INTEGER PRIMARY KEY AUTOINCREMENT)
* `type_transaction` (TEXT, requis) - Valeurs autorisées : `'depot'`, `'retrait'`, `'virement'`.
* `montant` (REAL, requis)
* `date_transaction` (DATETIME, par défaut `CURRENT_TIMESTAMP`)
* `description` (TEXT, motif de l'opération)
* `statut` (TEXT, par défaut `'valide'`)
* `compte_source_id` (INTEGER FK nullable, référence `COMPTES(id_compte)`)
* `compte_destination_id` (INTEGER FK nullable, référence `COMPTES(id_compte)`)

---

## 🔌 API REST (Points d'Entrée)

### Authentification (`/api/auth`)
* `POST /api/auth/register` : Crée un nouvel utilisateur.
* `POST /api/auth/login` : Authentifie l'utilisateur et retourne un token JWT.
* `GET /api/auth/me` : Récupère le profil de l'utilisateur connecté (Protéger par JWT).

### Comptes Bancaires (`/api/accounts`)
* `POST /api/accounts` : Crée un nouveau compte (`courant` ou `epargne`) pour l'utilisateur connecté (Protéger par JWT).
* `GET /api/accounts` : Récupère la liste de tous les comptes de l'utilisateur (Protéger par JWT).
* `GET /api/accounts/:id` : Récupère les détails d'un compte spécifique (Protéger par JWT).
* `DELETE /api/accounts/:id` : Clôture (supprime) un compte bancaire si son solde est strictement égal à 0 € (Protéger par JWT).

### Transactions (`/api/transactions`)
* `POST /api/transactions` : Exécute une opération bancaire (`depot`, `retrait`, `virement`) avec gestion de transaction ACID (Protéger par JWT).
* `GET /api/transactions/history/:accountId` : Récupère l'historique de toutes les transactions d'un compte (Protéger par JWT).

---

## ⚙️ Instructions d'Installation et de Démarrage

### 1. Configuration et Démarrage du Backend
1. Ouvrez un terminal et positionnez-vous dans le répertoire `backend` :
   ```bash
   cd backend
   ```
2. Installez les dépendances Node.js :
   ```bash
   npm install
   ```
3. Lancez le serveur Express (la base SQLite `database.sqlite` s'initialise automatiquement) :
   ```bash
   npm run dev
   ```
   Le serveur backend démarrera sur le port `5000` (`http://localhost:5000`).

### 2. Configuration et Démarrage du Frontend
1. Ouvrez un **nouveau terminal** et positionnez-vous dans le répertoire `frontend` :
   ```bash
   cd frontend
   ```
2. Installez les dépendances React :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement Vite :
   ```bash
   npm run dev
   ```
   L'interface web sera accessible à l'adresse `http://localhost:5173/`.

---

## 🧪 Validation & Tests

L'application contient un script de validation automatique sans dépendances externes pour tester les contrôleurs backend et la base de données.

Pour lancer les tests d'intégration API :
1. Assurez-vous que le serveur backend tourne sur le port `5000`.
2. Ouvrez un terminal et exécutez le script dans le dossier scratch de la session :
   ```bash
   node test_api.js
   ```
Le script simulera automatiquement une inscription complète en français, la création d'un compte courant et d'un compte épargne, l'exécution d'un dépôt, d'un retrait, et d'un virement inter-comptes avec double-écriture des soldes en vérifiant à chaque étape la justesse des calculs et la conformité des réponses JSON.
