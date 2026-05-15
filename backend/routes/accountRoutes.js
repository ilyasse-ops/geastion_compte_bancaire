const express = require('express');
const router = express.Router();
const { createAccount, getAccounts, getAccountById, deleteAccount } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createAccount);
router.get('/', protect, getAccounts);
router.get('/:id', protect, getAccountById);
router.delete('/:id', protect, deleteAccount);

module.exports = router;
