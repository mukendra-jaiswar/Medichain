require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const existing = await User.findOne({ email: 'patient@test.com' });
  if (existing) { console.log('✅ Test patient already exists'); process.exit(0); }

  await User.create({
    name: 'Rahul Sharma',
    email: 'patient@test.com',
    password: 'patient123',
    role: 'patient',
    phone: '+91 9876543210',
    gender: 'male',
  });
  
  console.log('✅ Test patient created: patient@test.com / patient123');
  process.exit(0);
};

seed().catch(e => { console.error(e); process.exit(1); });
