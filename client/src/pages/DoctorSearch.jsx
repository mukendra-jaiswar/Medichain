import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import {
  MapPin, Star, Search, Stethoscope, Building2,
  ChevronRight, Loader2, Award, Phone, Filter, X
} from 'lucide-react';

const SPECIALIZATIONS = [
  'all','Cardiologist','Neurologist','Orthopedist','Dermatologist',
  'Gastroenterologist','Pulmonologist','Psychiatrist','Endocrinologist',
  'General Physician','Pediatrician','Ophthalmologist','ENT Specialist'
];

const CITIES = [
  { name: 'All Cities', lat: 20.5937, lng: 78.9629 },
  { name: 'New Delhi',  lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai',     lat: 19.0760, lng: 72.8777 },
  { name: 'Nagpur',     lat: 21.1458, lng: 79.0882 },
  { name: 'Nashik',     lat: 19.9975, lng: 73.7898 },
  { name: 'Bangalore',  lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai',    lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad',  lat: 17.3850, lng: 78.4867 },
  { name: 'Pune',       lat: 18.5204, lng: 73.8567 },
  { name: 'Kolkata',    lat: 22.5726, lng: 88.3639 },
  { name: 'Ahmedabad',  lat: 23.0225, lng: 72.5714 },
];

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(i => (
      <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
    ))}
    <span className="text-xs text-gray-400 ml-1">{rating?.toFixed(1)}</span>
  </div>
);

const DoctorCard = ({ doc }) => (
  <div className="glass-card flex flex-col h-full group">
    {/* Top section */}
    <div className="flex items-start gap-4 mb-4">
      <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-lg shadow-primary-900/30 group-hover:scale-110 transition-transform duration-300">
        {doc.name?.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white text-lg leading-tight truncate">Dr. {doc.name}</h3>
        <span className="badge-primary mt-1 inline-flex">{doc.specialization}</span>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-accent-400 font-bold text-lg">₹{doc.consultationFee}</p>
        <p className="text-xs text-gray-500">per visit</p>
      </div>
    </div>

    {/* Rating */}
    <div className="mb-3">
      <StarRating rating={doc.rating} />
      <p className="text-xs text-gray-600 mt-0.5">{doc.totalReviews} reviews</p>
    </div>

    {/* Info grid */}
    <div className="space-y-2 flex-1">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span className="truncate">{doc.hospital}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>{doc.location?.city}, {doc.location?.state}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>{doc.experience} years experience</span>
      </div>
    </div>

    {/* Availability pills */}
    {doc.availability?.length > 0 && (
      <div className="flex flex-wrap gap-1.5 my-3">
        {doc.availability.slice(0, 5).map(a => (
          <span key={a.day} className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10">
            {a.day.slice(0, 3)}
          </span>
        ))}
      </div>
    )}

    {/* Book button */}
    <Link
      to={`/doctors/${doc._id}`}
      className="btn-primary w-full flex items-center justify-center gap-2 mt-3 py-2.5 text-sm"
    >
      View Profile & Book <ChevronRight className="w-4 h-4" />
    </Link>
  </div>
);

export default function DoctorSearch() {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || 'all');
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [searchName, setSearchName] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (selectedCity.name !== 'All Cities') params.set('city', selectedCity.name);
      if (specialization !== 'all') params.set('specialization', specialization);

      const { data } = await API.get(`/doctors?${params}`);
      setDoctors(data.doctors || []);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [selectedCity, specialization]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  // Client-side filter by name & sort
  const filtered = doctors
    .filter(d => !searchName || d.name.toLowerCase().includes(searchName.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'fee_low') return a.consultationFee - b.consultationFee;
      if (sortBy === 'fee_high') return b.consultationFee - a.consultationFee;
      if (sortBy === 'experience') return b.experience - a.experience;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">Find Doctors</h1>
        <p className="text-gray-400">Browse verified specialists across major Indian cities</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card mb-6">
        <div className="flex flex-wrap gap-4 items-end">

          {/* Search by name */}
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">Search Doctor</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                className="input-field pl-10"
                placeholder="Search by name..."
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
              />
              {searchName && (
                <button onClick={() => setSearchName('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* City */}
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                className="input-field pl-10"
                value={selectedCity.name}
                onChange={e => setSelectedCity(CITIES.find(c => c.name === e.target.value))}
              >
                {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Specialization */}
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">Specialization</label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                className="input-field pl-10"
                value={specialization}
                onChange={e => setSpecialization(e.target.value)}
              >
                {SPECIALIZATIONS.map(s => (
                  <option key={s} value={s}>{s === 'all' ? 'All Specializations' : s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="min-w-40">
            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">Sort By</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                className="input-field pl-10"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="rating">Top Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fee_low">Fee: Low to High</option>
                <option value="fee_high">Fee: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active city pills */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
          {CITIES.map(c => (
            <button
              key={c.name}
              onClick={() => setSelectedCity(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCity.name === c.name
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm">
          {loading ? 'Loading...' : `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''} found`}
          {selectedCity.name !== 'All Cities' && ` in ${selectedCity.name}`}
          {specialization !== 'all' && ` · ${specialization}`}
        </p>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Finding doctors near you...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card text-center py-16 border border-amber-500/20 bg-amber-500/5">
          <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <MapPin className="w-10 h-10 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No doctors registered for{' '}
            <span className="text-amber-400">
              {selectedCity.name !== 'All Cities' ? selectedCity.name : 'this location'}
            </span>
          </h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">
            {specialization !== 'all'
              ? `No ${specialization} found in ${selectedCity.name}. Try a different specialization or city.`
              : `We haven't onboarded any doctors in ${selectedCity.name} yet. Please check another city.`}
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {specialization !== 'all' && (
              <button
                onClick={() => setSpecialization('all')}
                className="btn-secondary text-sm px-5 py-2"
              >
                Clear Specialization
              </button>
            )}
            <button
              onClick={() => { setSpecialization('all'); setSelectedCity(CITIES[0]); setSearchName(''); }}
              className="btn-primary text-sm px-5 py-2"
            >
              Show All Cities
            </button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(doc => <DoctorCard key={doc._id} doc={doc} />)}
        </div>
      )}
    </div>
  );
}
