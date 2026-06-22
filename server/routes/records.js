const express = require('express');
const router = express.Router();
const { addRecord, getRecords, verifyRecord } = require('../controllers/recordController');
const { protect, requireRole } = require('../middleware/auth');

router.post('/add', protect, requireRole('doctor'), addRecord);
router.get('/verify/:hash', protect, verifyRecord);
router.get('/:patientId', protect, getRecords);

module.exports = router;
