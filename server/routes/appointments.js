const express = require('express');
const router = express.Router();
const { bookAppointment, getAppointments, updateAppointmentStatus, addDiagnosis } = require('../controllers/appointmentController');
const { protect, requireRole } = require('../middleware/auth');

router.post('/book', protect, requireRole('patient'), bookAppointment);
router.get('/:userId', protect, getAppointments);
router.patch('/:id/status', protect, requireRole('doctor'), updateAppointmentStatus);
router.post('/:id/diagnosis', protect, requireRole('doctor'), addDiagnosis);

module.exports = router;
