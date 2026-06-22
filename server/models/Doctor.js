const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  specialization: { type: String, required: true },
  licenseNo: { type: String, required: true, unique: true },
  bio: { type: String, default: '' },
  experience: { type: Number, default: 0 }, // years
  consultationFee: { type: Number, default: 500 },
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  hospital: { type: String, default: '' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' }
  },
  availability: [
    {
      day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      slots: [{ type: String }] // e.g., ['09:00', '09:30', '10:00']
    }
  ],
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  walletAddress: { type: String, default: '' } // Ethereum wallet for blockchain
}, { timestamps: true });

doctorSchema.index({ location: '2dsphere' });
doctorSchema.index({ specialization: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
