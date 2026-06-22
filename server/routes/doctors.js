const express = require('express');
const router = express.Router();
const { getNearbyDoctors, getDoctorById, getAllDoctors, getAvailableSlots, updateDoctorProfile } = require('../controllers/doctorController');
const { protect, requireRole } = require('../middleware/auth');

// Public — no auth needed to browse doctors
router.get('/nearby', getNearbyDoctors);
router.get('/', getAllDoctors);
router.get('/:id/slots', getAvailableSlots);
router.get('/:id', getDoctorById);

// Protected — only doctors can update their own profile
router.patch('/profile', protect, requireRole('doctor'), updateDoctorProfile);

module.exports = router;
