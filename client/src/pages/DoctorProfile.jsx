import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import { Star, MapPin, Building2, Clock, Calendar, ChevronLeft, ChevronRight, Loader2, Stethoscope, Award, DollarSign } from 'lucide-react';
import { format, addDays, startOfToday, isBefore } from 'date-fns';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(i => (
      <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
    ))}
    <span className="text-sm text-gray-400 ml-1">{rating?.toFixed(1)}</span>
  </div>
);

export default function DoctorProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [notes, setNotes] = useState('');
  const [dateOffset, setDateOffset] = useState(0);

  const today = startOfToday();
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i + dateOffset));

  useEffect(() => {
    API.get(`/doctors/${id}`).then(r => setDoctor(r.data))
      .catch(() => toast.error('Doctor not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const selectDate = async (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlotsLoading(true);
    try {
      const { data } = await API.get(`/doctors/${id}/slots?date=${format(date, 'yyyy-MM-dd')}`);
      setSlots(data.slots);
      if (data.slots.length === 0) toast('No available slots on this day', { icon: 'ℹ️' });
    } catch { toast.error('Could not load slots'); }
    finally { setSlotsLoading(false); }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) return toast.error('Please select a date and time slot');
    setBooking(true);
    try {
      await API.post('/appointments/book', {
        doctorId: id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedSlot,
        notes,
        symptoms: [],
      });
      toast.success('Appointment booked successfully! 🎉');
      navigate('/dashboard/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setBooking(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
    </div>
  );
  if (!doctor) return <div className="text-center py-20 text-gray-400">Doctor not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />Back to Search
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Doctor Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-accent-500 rounded-3xl flex items-center justify-center text-white font-black text-4xl mx-auto mb-4 shadow-2xl shadow-primary-900/50">
              {doctor.name?.charAt(0)}
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Dr. {doctor.name}</h1>
            <span className="badge-primary">{doctor.specialization}</span>
            <div className="mt-3"><StarRating rating={doctor.rating} /></div>
            <p className="text-xs text-gray-500 mt-1">{doctor.totalReviews} reviews</p>
          </div>

          <div className="glass-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Hospital</p>
                <p className="text-sm text-white font-medium">{doctor.hospital}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm text-white font-medium">{doctor.location?.city}, {doctor.location?.state}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Experience</p>
                <p className="text-sm text-white font-medium">{doctor.experience} years</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Consultation Fee</p>
                <p className="text-sm text-white font-medium">₹{doctor.consultationFee}</p>
              </div>
            </div>
          </div>

          {doctor.bio && (
            <div className="glass-card">
              <h3 className="font-semibold text-white mb-2 text-sm">About</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{doctor.bio}</p>
            </div>
          )}
        </div>

        {/* Right: Booking */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-400" />Book Appointment
            </h2>

            {/* Date picker */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-300">Select Date</p>
                <div className="flex gap-2">
                  <button onClick={() => setDateOffset(Math.max(0, dateOffset - 7))} disabled={dateOffset === 0}
                    className="p-1.5 rounded-lg glass hover:bg-white/10 disabled:opacity-30 transition-all">
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => setDateOffset(dateOffset + 7)}
                    className="p-1.5 rounded-lg glass hover:bg-white/10 transition-all">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {dates.map((date) => {
                  const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  const isPast = isBefore(date, today);
                  return (
                    <button key={date.toISOString()} onClick={() => !isPast && selectDate(date)} disabled={isPast}
                      className={`flex flex-col items-center py-3 rounded-xl transition-all ${isSelected ? 'bg-primary-600 text-white shadow-lg' : isPast ? 'opacity-30 cursor-not-allowed text-gray-600' : 'glass text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                      <span className="text-xs">{DAYS[date.getDay()]}</span>
                      <span className="text-lg font-bold">{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-400" />
                  Available Slots for {format(selectedDate, 'EEEE, MMMM d')}
                </p>
                {slotsLoading ? (
                  <div className="flex items-center gap-2 text-gray-400 py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />Loading slots...
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4">No available slots on this day</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map(slot => (
                      <button key={slot} onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedSlot === slot ? 'bg-primary-600 text-white shadow-lg' : 'glass text-gray-300 hover:text-white hover:bg-white/10'}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
              <textarea className="input-field resize-none h-20" placeholder="Briefly describe your symptoms or reason for visit..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            {/* Summary */}
            {selectedDate && selectedSlot && (
              <div className="p-4 bg-accent-500/10 border border-accent-500/30 rounded-xl mb-5">
                <p className="text-sm text-accent-300 font-semibold mb-1">📅 Appointment Summary</p>
                <p className="text-sm text-gray-300">
                  Dr. {doctor.name} · {format(selectedDate, 'MMMM d, yyyy')} at {selectedSlot}
                </p>
                <p className="text-xs text-gray-500 mt-1">Consultation fee: ₹{doctor.consultationFee}</p>
              </div>
            )}

            <button onClick={handleBook} disabled={!selectedDate || !selectedSlot || booking}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50">
              {booking ? <><Loader2 className="w-5 h-5 animate-spin" />Booking...</>
                : <><Calendar className="w-5 h-5" />Confirm Appointment</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
