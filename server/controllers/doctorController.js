const Doctor = require('../models/Doctor');

// GET /api/doctors/nearby?lat=&lng=&specialization=&radius=
const getNearbyDoctors = async (req, res) => {
  try {
    const { lat, lng, specialization, radius = 50000 } = req.query; // radius in meters

    let query = {};

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      };
    }

    if (specialization && specialization !== 'all') {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    query.isAvailable = true;

    const doctors = await Doctor.find(query).limit(20);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors
const getAllDoctors = async (req, res) => {
  try {
    const { specialization, city, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (specialization && specialization !== 'all') filter.specialization = { $regex: specialization, $options: 'i' };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    const doctors = await Doctor.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Doctor.countDocuments(filter);
    res.json({ doctors, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/:id/slots?date=YYYY-MM-DD
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const dayAvailability = doctor.availability.find(a => a.day === dayName);

    if (!dayAvailability) return res.json({ slots: [] });

    // Filter out already booked slots
    const Appointment = require('../models/Appointment');
    const booked = await Appointment.find({
      doctorId: req.params.id,
      date: { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) },
      status: { $in: ['pending', 'confirmed'] }
    }).select('timeSlot');

    const bookedSlots = booked.map(a => a.timeSlot);
    const availableSlots = dayAvailability.slots.filter(s => !bookedSlots.includes(s));
    res.json({ slots: availableSlots, day: dayName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/doctors/profile (doctor updates own profile)
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNearbyDoctors, getDoctorById, getAllDoctors, getAvailableSlots, updateDoctorProfile };
