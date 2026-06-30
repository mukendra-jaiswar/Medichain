const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const crypto = require('crypto');

const hashRecord = (data) => crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

// Helper: push notification to a user
const pushNotification = async (userId, message, type = 'appointment', link = '') => {
  await User.findByIdAndUpdate(userId, {
    $push: { notifications: { message, type, link, read: false, createdAt: new Date() } }
  });
};

// POST /api/appointments/book
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, symptoms, predictedDisease, notes } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Check slot not already taken
    const conflict = await Appointment.findOne({
      doctorId,
      date: { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) },
      timeSlot,
      status: { $in: ['pending', 'confirmed'] }
    });
    if (conflict) return res.status(400).json({ message: 'This slot is already booked' });

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date: new Date(date),
      timeSlot,
      symptoms: symptoms || [],
      predictedDisease: predictedDisease || '',
      notes: notes || ''
    });

    // Notify patient
    await pushNotification(
      req.user._id,
      `Your appointment with Dr. ${doctor.name} on ${new Date(date).toDateString()} at ${timeSlot} is pending confirmation.`,
      'appointment',
      '/dashboard/patient'
    );

    // Notify doctor's user account
    const doctorUser = await User.findById(doctor.userId);
    if (doctorUser) {
      await pushNotification(
        doctorUser._id,
        `New appointment request from patient on ${new Date(date).toDateString()} at ${timeSlot}.`,
        'appointment',
        '/dashboard/doctor'
      );
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/appointments/:userId
const getAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let appointments;
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.params.userId });
      if (!doctor) return res.json([]);
      appointments = await Appointment.find({ doctorId: doctor._id })
        .populate('patientId', 'name email phone avatar gender dateOfBirth')
        .sort({ date: -1 });
    } else {
      appointments = await Appointment.find({ patientId: req.params.userId })
        .populate('doctorId')
        .sort({ date: -1 });
    }

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/appointments/:id/status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('doctorId');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = status;
    await appointment.save();

    // Notify patient
    const statusMessages = {
      confirmed: `Your appointment has been confirmed by Dr. ${appointment.doctorId?.name}.`,
      cancelled: `Your appointment has been cancelled.`,
      completed: `Your appointment is marked as completed.`
    };
    if (statusMessages[status]) {
      await pushNotification(appointment.patientId, statusMessages[status], 'appointment', '/dashboard/patient');
    }

    res.json({ message: 'Status updated', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/appointments/:id/diagnosis
const addDiagnosis = async (req, res) => {
  try {
    const { diagnosis, prescription } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Generate record hash automatically to secure on the chain
    const recordData = {
      patientId: appointment.patientId._id,
      doctorId: appointment.doctorId._id,
      diagnosis,
      prescription,
      notes: appointment.notes || '',
      symptoms: appointment.symptoms,
      date: new Date().toISOString()
    };
    const recordHash = hashRecord(recordData);

    appointment.diagnosis = diagnosis;
    appointment.prescription = prescription;
    appointment.recordId = recordHash;
    appointment.status = 'completed';
    await appointment.save();

    await pushNotification(
      appointment.patientId._id,
      `Your medical record has been added by your doctor and secured on the blockchain.`,
      'record',
      '/records'
    );

    res.json({ message: 'Diagnosis added and secured', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { bookAppointment, getAppointments, updateAppointmentStatus, addDiagnosis };
