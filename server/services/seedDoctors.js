require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
};

const specializations = [
  'Cardiologist', 'Neurologist', 'Orthopedist', 'Dermatologist',
  'Gastroenterologist', 'Pulmonologist', 'Psychiatrist', 'Endocrinologist',
  'General Physician', 'Pediatrician', 'Ophthalmologist', 'ENT Specialist'
];

const cities = [
  { name: 'New Delhi',  state: 'Delhi',         lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai',     state: 'Maharashtra',    lat: 19.0760, lng: 72.8777 },
  { name: 'Nagpur',     state: 'Maharashtra',    lat: 21.1458, lng: 79.0882 },
  { name: 'Nashik',     state: 'Maharashtra',    lat: 19.9975, lng: 73.7898 },
  { name: 'Bangalore',  state: 'Karnataka',      lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai',    state: 'Tamil Nadu',     lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad',  state: 'Telangana',      lat: 17.3850, lng: 78.4867 },
  { name: 'Pune',       state: 'Maharashtra',    lat: 18.5204, lng: 73.8567 },
  { name: 'Kolkata',    state: 'West Bengal',    lat: 22.5726, lng: 88.3639 },
  { name: 'Ahmedabad',  state: 'Gujarat',        lat: 23.0225, lng: 72.5714 },
];

const hospitals = [
  'Apollo Hospital', 'Fortis Healthcare', 'Max Hospital', 'AIIMS',
  'Manipal Hospital', 'Narayana Health', 'Medanta', 'Aster Hospital'
];

const doctorNames = [
  // New Delhi (4)
  'Rajesh Kumar', 'Sunita Patel', 'Suresh Iyer', 'Manoj Tiwari',
  // Mumbai (4)
  'Priya Sharma', 'Meera Gupta', 'Ananya Banerjee', 'Rohit Agarwal',
  // Nagpur (4)
  'Vivek Deshmukh', 'Rashmi Bhagat', 'Nikhil Zade', 'Pooja Borkar',
  // Nashik (4)
  'Amit Kulkarni', 'Sneha Joshi', 'Rahul Pawar', 'Nandini More',
  // Bangalore (4)
  'Anil Mehta', 'Sanjay Rathi', 'Divya Menon', 'Leela Nambiar',
  // Chennai (4)
  'Vikram Singh', 'Rekha Pillai', 'Divya Menon', 'Pooja Verma',
  // Hyderabad (4)
  'Arjun Reddy', 'Karan Kapoor', 'Amit Bhatia', 'Kavita Joshi',
  // Pune (4)
  'Deepa Nair', 'Nitin Desai', 'Shalini Khanna', 'Gaurav Shah',
  // Kolkata (4)
  'Rohit Agarwal', 'Nitin Desai', 'Gaurav Shah', 'Nisha Malhotra',
  // Ahmedabad (4)
  'Kavita Joshi', 'Shalini Khanna', 'Nisha Malhotra', 'Leela Nambiar',
];

const defaultSlots = [
  ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'],
  ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'],
  ['10:00', '10:30', '11:00', '11:30', '16:00', '16:30', '17:00']
];

const seedDoctors = async () => {
  await connectDB();
  await Doctor.deleteMany({});
  await User.deleteMany({ role: 'doctor' });

  console.log('🌱 Seeding doctors...');

  const hashedPassword = await bcrypt.hash('Doctor@123', 12);

  for (let i = 0; i < doctorNames.length; i++) {
    const name = doctorNames[i];
    const city = cities[i % cities.length];
    const specialization = specializations[i % specializations.length];
    const hospital = hospitals[i % hospitals.length];
    const slots = defaultSlots[i % defaultSlots.length];

    // Small random offset to coordinates (within ~5km)
    const latOffset = (Math.random() - 0.5) * 0.08;
    const lngOffset = (Math.random() - 0.5) * 0.08;

    const email = `doctor${i + 1}@medichain.com`;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'doctor',
      phone: `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`,
      gender: i % 2 === 0 ? 'male' : 'female'
    });
    // Skip hashing (already hashed)
    await User.updateOne({ _id: user._id }, { password: hashedPassword });

    await Doctor.create({
      userId: user._id,
      name,
      email,
      specialization,
      licenseNo: `MCI${100000 + i}`,
      bio: `Dr. ${name} is an experienced ${specialization} with ${10 + (i % 15)} years of practice at ${hospital}.`,
      experience: 10 + (i % 15),
      consultationFee: 300 + (i % 10) * 100,
      rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
      totalReviews: 50 + i * 7,
      hospital,
      location: {
        type: 'Point',
        coordinates: [city.lng + lngOffset, city.lat + latOffset],
        address: `${100 + i} Medical Complex, ${city.name}`,
        city: city.name,
        state: city.state
      },
      availability: [
        { day: 'Monday', slots },
        { day: 'Tuesday', slots },
        { day: 'Wednesday', slots },
        { day: 'Thursday', slots },
        { day: 'Friday', slots },
        { day: 'Saturday', slots: slots.slice(0, 5) }
      ],
      isVerified: true,
      isAvailable: true
    });

    console.log(`  ✅ Created Dr. ${name} (${specialization}) in ${city.name}`);
  }

  console.log('\n✅ Seeding complete! 24 doctors created.');
  console.log('   Login credentials: doctor1@medichain.com / Doctor@123');
  process.exit(0);
};

seedDoctors().catch(err => { console.error(err); process.exit(1); });
