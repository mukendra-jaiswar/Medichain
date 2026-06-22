import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Heart, Mail, Lock, User, Phone, Stethoscope, Eye, EyeOff, ArrowRight, ChevronRight } from 'lucide-react';

const SPECIALIZATIONS = [
  'Cardiologist','Neurologist','Orthopedist','Dermatologist',
  'Gastroenterologist','Pulmonologist','Psychiatrist','Endocrinologist',
  'General Physician','Pediatrician','Ophthalmologist','ENT Specialist'
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', gender: '',
    specialization: '', licenseNo: '', hospital: '', city: '', state: ''
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (role === 'doctor' && (!form.specialization || !form.licenseNo)) return toast.error('Specialization and License No. are required');
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      toast.success(`Account created! Welcome, ${user.name} 🎉`);
      navigate(role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-lg animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl items-center justify-center mb-4 shadow-2xl">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Join MediChain today</p>
        </div>

        <div className="glass-card">
          {/* Role Toggle */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
            {['patient','doctor'].map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                  role === r ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                {r === 'patient' ? '🧑‍⚕️ Patient' : '👨‍⚕️ Doctor'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input className="input-field pl-11" placeholder="Full Name *" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" className="input-field pl-11" placeholder="Email Address *" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type={showPass ? 'text' : 'password'} className="input-field pl-11 pr-11" placeholder="Password (min 6 chars) *" value={form.password} onChange={e => set('password', e.target.value)} />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input className="input-field pl-11" placeholder="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <select className="input-field" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Doctor-only fields */}
            {role === 'doctor' && (
              <div className="space-y-4 pt-2 border-t border-white/10">
                <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5" />Doctor Information
                </p>
                <select className="input-field" value={form.specialization} onChange={e => set('specialization', e.target.value)}>
                  <option value="">Select Specialization *</option>
                  {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                </select>
                <input className="input-field" placeholder="Medical License No. *" value={form.licenseNo} onChange={e => set('licenseNo', e.target.value)} />
                <input className="input-field" placeholder="Hospital / Clinic Name" value={form.hospital} onChange={e => set('hospital', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <input className="input-field" placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} />
                  <input className="input-field" placeholder="State" value={form.state} onChange={e => set('state', e.target.value)} />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
