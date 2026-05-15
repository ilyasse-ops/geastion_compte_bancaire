const express = require('express');
const router = express.Router();
const { performTransaction, getTransactionHistory } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, performTransaction);
router.get('/:accountId', protect, getTransactionHistory);

module.exports = router;
