const axios = require('axios');

// POST /api/symptoms/predict
const predictDisease = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one symptom' });
    }

    const response = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, { symptoms });
    res.json(response.data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'ML service is not available. Please try again later.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET /api/symptoms/list
const getSymptomList = async (req, res) => {
  try {
    const response = await axios.get(`${process.env.ML_SERVICE_URL}/symptoms`);
    res.json(response.data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'ML service is not available' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { predictDisease, getSymptomList };
