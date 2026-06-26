const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const hashRecord = (data) => crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

const sampleRecords = [
  {
    symptoms: ['headache', 'high_fever', 'nausea'],
    predictedDisease: 'Malaria',
    diagnosis: 'Malaria',
    prescription: 'Chloroquine 500mg twice daily for 3 days. Paracetamol 500mg for fever. Rest and adequate hydration.',
    notes: 'Patient showed improvement after first dose. Follow up in 7 days.',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    timeSlot: '10:00'
  },
  {
    symptoms: ['chest_pain', 'breathlessness', 'fast_heart_rate'],
    predictedDisease: 'Heart Disease',
    diagnosis: 'Hypertensive Heart Disease',
    prescription: 'Amlodipine 5mg once daily. Enalapril 10mg twice daily. Low sodium diet strictly recommended.',
    notes: 'BP: 160/100. ECG shows LVH. Echocardiography recommended.',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    timeSlot: '11:00'
  },
  {
    symptoms: ['joint_pain', 'fatigue', 'skin_rash'],
    predictedDisease: 'Allergy',
    diagnosis: 'Allergic Arthritis',
    prescription: 'Cetirizine 10mg once daily. Ibuprofen 400mg thrice daily after meals. Topical Hydrocortisone cream.',
    notes: 'Avoid known allergens. Skin patch test recommended.',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    timeSlot: '14:00'
  }
];

async function seedRecords() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Find the test patient
  const patient = await User.findOne({ email: 'patient@test.com' });
  if (!patient) {
    console.error('Test patient not found. Run: npm run seed-patient first.');
    process.exit(1);
  }

  // Find any available doctor
  const doctors = await Doctor.find().limit(3);
  if (doctors.length === 0) {
    console.error('No doctors found. Run: npm run seed first.');
    process.exit(1);
  }

  // Remove old seeded appointments for this patient (only completed ones with records)
  await Appointment.deleteMany({
    patientId: patient._id,
    status: 'completed',
    notes: { $regex: /Follow up|ECG|Skin patch/i }
  });

  let created = 0;
  for (let i = 0; i < sampleRecords.length; i++) {
    const rec = sampleRecords[i];
    const doctor = doctors[i % doctors.length];

    const recordData = {
      patientId: patient._id,
      doctorId: doctor._id,
      diagnosis: rec.diagnosis,
      prescription: rec.prescription,
      notes: rec.notes,
      symptoms: rec.symptoms,
      date: rec.date.toISOString()
    };
    const recordHash = hashRecord(recordData);

    await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      date: rec.date,
      timeSlot: rec.timeSlot,
      status: 'completed',
      symptoms: rec.symptoms,
      predictedDisease: rec.predictedDisease,
      diagnosis: rec.diagnosis,
      prescription: rec.prescription,
      notes: rec.notes,
      recordId: recordHash
    });

    console.log(`  Created record: ${rec.diagnosis} (${recordHash.slice(0, 16)}...)`);
    created++;
  }

  console.log(`\nSeeded ${created} medical records for ${patient.name}`);
  console.log('Login as patient@test.com / patient123 to view them.');
  await mongoose.disconnect();
}

seedRecords().catch(e => { console.error(e); process.exit(1); });
