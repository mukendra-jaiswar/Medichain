const Appointment = require('../models/Appointment');
const User = require('../models/User');
const crypto = require('crypto');

// Hash medical record data
const hashRecord = (data) => crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

// POST /api/records/add
const addRecord = async (req, res) => {
  try {
    const { appointmentId, diagnosis, prescription, notes } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email')
      .populate('doctorId');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const recordData = {
      patientId: appointment.patientId._id,
      doctorId: appointment.doctorId._id,
      diagnosis,
      prescription,
      notes,
      symptoms: appointment.symptoms,
      date: new Date().toISOString()
    };

    const recordHash = hashRecord(recordData);

    // Update appointment with diagnosis and hash
    appointment.diagnosis = diagnosis;
    appointment.prescription = prescription;
    appointment.notes = notes || appointment.notes;
    appointment.recordId = recordHash;
    appointment.status = 'completed';
    await appointment.save();

    // Notify patient
    await User.findByIdAndUpdate(appointment.patientId._id, {
      $push: {
        notifications: {
          message: `Your medical record has been added by your doctor and secured on the blockchain.`,
          type: 'record',
          link: '/records',
          read: false,
          createdAt: new Date()
        }
      }
    });

    res.json({
      message: 'Medical record saved and hashed',
      recordHash,
      record: { ...recordData, recordHash }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/records/:patientId
const getRecords = async (req, res) => {
  try {
    const records = await Appointment.find({
      patientId: req.params.patientId,
      status: 'completed'
    })
      .populate('doctorId', 'name specialization hospital location')
      .sort({ createdAt: -1 });

    const formatted = records.map(apt => ({
      id: apt._id,
      date: apt.date,
      doctor: apt.doctorId,
      diagnosis: apt.diagnosis,
      prescription: apt.prescription,
      symptoms: apt.symptoms,
      recordHash: apt.recordId,
      notes: apt.notes,
      blockchainVerified: !!apt.recordId
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/records/verify/:hash
const verifyRecord = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ recordId: req.params.hash });
    if (!appointment) return res.json({ verified: false, message: 'Record hash not found' });
    res.json({
      verified: true,
      message: 'Record hash verified on database',
      appointmentId: appointment._id,
      createdAt: appointment.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addRecord, getRecords, verifyRecord };
