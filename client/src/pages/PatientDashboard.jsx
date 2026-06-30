import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Calendar, FileText, Stethoscope, Clock, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, Brain, MapPin,
  Activity, Loader2, User, Building2
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  pending:   { color: 'badge-warning',  icon: AlertCircle,   label: 'Pending' },
  confirmed: { color: 'badge-info',     icon: Clock,          label: 'Confirmed' },
  completed: { color: 'badge-success',  icon: CheckCircle2,   label: 'Completed' },
  cancelled: { color: 'badge-danger',   icon: XCircle,        label: 'Cancelled' },
};

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-600">{sub}</p>}
    </div>
  </div>
);

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    if (!user) return;
    const userId = user._id || user.id;
    API.get(`/appointments/${userId}`)
      .then(r => setAppointments(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, [user]);

  const upcoming = appointments.filter(a => ['pending','confirmed'].includes(a.status));
  const past     = appointments.filter(a => ['completed','cancelled'].includes(a.status));
  const shown    = tab === 'upcoming' ? upcoming : past;

  const stats = {
    total:     appointments.length,
    upcoming:  upcoming.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    records:   appointments.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400 mt-1">Here's your health overview</p>
        </div>
        <div className="flex gap-3">
          <Link to="/symptoms" className="btn-primary flex items-center gap-2">
            <Brain className="w-4 h-4" />Check Symptoms
          </Link>
          <Link to="/doctors" className="btn-secondary flex items-center gap-2">
            <MapPin className="w-4 h-4" />Find Doctors
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Calendar}    label="Total Appointments" value={stats.total}     color="bg-gradient-to-br from-primary-600 to-primary-400" />
        <StatCard icon={Clock}       label="Upcoming"           value={stats.upcoming}  color="bg-gradient-to-br from-amber-600 to-amber-400" />
        <StatCard icon={CheckCircle2} label="Completed"          value={stats.completed} color="bg-gradient-to-br from-emerald-600 to-emerald-400" />
        <StatCard icon={FileText}    label="Medical Records"    value={stats.records}   color="bg-gradient-to-br from-violet-600 to-violet-400" />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { to: '/symptoms', icon: Brain,      label: 'AI Symptom Checker', desc: 'Get instant disease prediction', color: 'from-violet-600/20 to-primary-600/20', border: 'border-primary-500/20' },
          { to: '/doctors',  icon: Stethoscope, label: 'Find Specialists',    desc: 'Browse doctors near you on map', color: 'from-blue-600/20 to-cyan-600/20',    border: 'border-blue-500/20' },
          { to: '/records',  icon: FileText,    label: 'Medical Records',      desc: 'View blockchain-secured records', color: 'from-emerald-600/20 to-accent-600/20', border: 'border-emerald-500/20' },
        ].map(({ to, icon: Icon, label, desc, color, border }) => (
          <Link key={to} to={to} className={`glass-card bg-gradient-to-br ${color} border ${border} group`}>
            <Icon className="w-8 h-8 text-primary-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-1">{label}</h3>
            <p className="text-gray-400 text-sm">{desc}</p>
            <div className="flex items-center gap-1 text-primary-400 text-xs mt-3 font-semibold">
              Open <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Appointments */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">My Appointments</h2>
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            {['upcoming','past'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                {t} {t === 'upcoming' ? `(${stats.upcoming})` : `(${stats.completed + appointments.filter(a=>a.status==='cancelled').length})`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No {tab} appointments</p>
            {tab === 'upcoming' && (
              <Link to="/doctors" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm mt-3 font-semibold">
                Book one now <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map(apt => {
              const cfg = STATUS_CONFIG[apt.status];
              const StatusIcon = cfg.icon;
              return (
                <div key={apt._id} className="glass rounded-xl p-4 hover:bg-white/5 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {apt.doctorId?.name?.charAt(0) || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-white">Dr. {apt.doctorId?.name}</h3>
                          <p className="text-xs text-primary-300">{apt.doctorId?.specialization}</p>
                        </div>
                        <span className={cfg.color}>
                          <StatusIcon className="w-3 h-3" />{cfg.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                          {format(new Date(apt.date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{apt.timeSlot}</span>
                        {apt.doctorId?.hospital && (
                          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{apt.doctorId.hospital}</span>
                        )}
                      </div>
                      {apt.diagnosis && (
                        <div className="mt-2 p-2 bg-accent-500/10 rounded-lg border border-accent-500/20">
                          <p className="text-xs text-accent-300 font-semibold">Diagnosis:</p>
                          <p className="text-xs text-gray-300 mt-0.5">{apt.diagnosis}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
