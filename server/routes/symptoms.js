const express = require('express');
const router = express.Router();
const { predictDisease, getSymptomList } = require('../controllers/symptomController');

// Public — no auth needed to use the symptom checker
router.post('/predict', predictDisease);
router.get('/list', getSymptomList);

module.exports = router;
