import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle, User,
  FileText, Loader2, ChevronDown, ChevronUp, Stethoscope, Activity, Shield
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  pending:   { color: 'badge-warning', icon: AlertCircle, label: 'Pending' },
  confirmed: { color: 'badge-info',    icon: Clock,        label: 'Confirmed' },
  completed: { color: 'badge-success', icon: CheckCircle2, label: 'Completed' },
  cancelled: { color: 'badge-danger',  icon: XCircle,      label: 'Cancelled' },
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="stat-card">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </div>
);

export default function DoctorDashboard() {
  const { user, doctorProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [expanded, setExpanded] = useState(null);
  const [diagForm, setDiagForm] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [addingRecord, setAddingRecord] = useState(null);

  useEffect(() => {
    if (!user) return;
    API.get(`/appointments/${user.id}`)
      .then(r => setAppointments(r.data))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, [user]);

  const reload = () => {
    API.get(`/appointments/${user.id}`).then(r => setAppointments(r.data));
  };

  const updateStatus = async (aptId, status) => {
    setSubmitting(aptId);
    try {
      await API.patch(`/appointments/${aptId}/status`, { status });
      toast.success(`Appointment ${status}!`);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSubmitting(null); }
  };

  const addDiagnosis = async (apt) => {
    const form = diagForm[apt._id] || {};
    if (!form.diagnosis) return toast.error('Please enter a diagnosis');
    setSubmitting(apt._id);
    try {
      await API.post(`/appointments/${apt._id}/diagnosis`, {
        diagnosis: form.diagnosis,
        prescription: form.prescription || ''
      });
      toast.success('Diagnosis saved!');
      setExpanded(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save diagnosis');
    } finally { setSubmitting(null); }
  };

  const addBlockchainRecord = async (apt) => {
    const form = diagForm[apt._id] || {};
    if (!apt.diagnosis && !form.diagnosis) return toast.error('Add diagnosis first');
    setAddingRecord(apt._id);
    try {
      await API.post('/records/add', {
        appointmentId: apt._id,
        diagnosis: apt.diagnosis || form.diagnosis,
        prescription: apt.prescription || form.prescription || '',
        notes: apt.notes || ''
      });
      toast.success('✅ Medical record secured on blockchain!');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add record');
    } finally { setAddingRecord(null); }
  };

  const tabFilter = {
    pending:   ['pending'],
    confirmed: ['confirmed'],
    completed: ['completed'],
    all:       ['pending','confirmed','completed','cancelled'],
  };

  const shown = appointments.filter(a => tabFilter[tab]?.includes(a.status));
  const counts = {
    pending:   appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-1">
          Dr. <span className="gradient-text">{user?.name?.split(' ').slice(-1)[0]}</span>'s Dashboard
        </h1>
        <p className="text-gray-400">{doctorProfile?.specialization} · {doctorProfile?.hospital}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={AlertCircle}  label="Pending Requests" value={counts.pending}   color="bg-gradient-to-br from-amber-600 to-amber-400" />
        <StatCard icon={Clock}        label="Confirmed"         value={counts.confirmed} color="bg-gradient-to-br from-blue-600 to-blue-400" />
        <StatCard icon={CheckCircle2} label="Completed"         value={counts.completed} color="bg-gradient-to-br from-emerald-600 to-emerald-400" />
        <StatCard icon={Activity}     label="Total Patients"    value={appointments.length} color="bg-gradient-to-br from-primary-600 to-primary-400" />
      </div>

      {/* Appointment Queue */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Appointment Queue</h2>
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
            {Object.keys(tabFilter).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                {t} {counts[t] !== undefined && counts[t] > 0 ? `(${counts[t]})` : ''}
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
            <Stethoscope className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">No {tab} appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map(apt => {
              const cfg = STATUS_CONFIG[apt.status];
              const StatusIcon = cfg.icon;
              const isExpanded = expanded === apt._id;
              const form = diagForm[apt._id] || {};

              return (
                <div key={apt._id} className="glass rounded-xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {apt.patientId?.name?.charAt(0) || 'P'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h3 className="font-semibold text-white">{apt.patientId?.name}</h3>
                            <p className="text-xs text-gray-500">{apt.patientId?.email}</p>
                          </div>
                          <span className={cfg.color}><StatusIcon className="w-3 h-3" />{cfg.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                            {format(new Date(apt.date), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{apt.timeSlot}</span>
                          {apt.patientId?.gender && <span className="capitalize">{apt.patientId.gender}</span>}
                        </div>

                        {/* Symptoms */}
                        {apt.symptoms?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {apt.symptoms.slice(0,5).map(s => (
                              <span key={s} className="badge-primary text-xs">{s.replace(/_/g,' ')}</span>
                            ))}
                          </div>
                        )}
                        {apt.predictedDisease && (
                          <p className="text-xs text-amber-400 mt-1.5">
                            🤖 AI Prediction: <span className="font-semibold">{apt.predictedDisease}</span>
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {apt.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(apt._id, 'confirmed')} disabled={submitting === apt._id}
                              className="btn-accent text-xs px-3 py-1.5">
                              {submitting === apt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                            </button>
                            <button onClick={() => updateStatus(apt._id, 'cancelled')} disabled={submitting === apt._id}
                              className="text-xs px-3 py-1.5 glass text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                              Cancel
                            </button>
                          </>
                        )}
                        {apt.status === 'confirmed' && (
                          <button onClick={() => setExpanded(isExpanded ? null : apt._id)}
                            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            Diagnose {isExpanded ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
                          </button>
                        )}
                        {apt.status === 'completed' && !apt.recordId && (
                          <button onClick={() => addBlockchainRecord(apt)} disabled={addingRecord === apt._id}
                            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 border border-primary-500/30">
                            {addingRecord === apt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Shield className="w-3.5 h-3.5 text-primary-400"/>Save to Chain</>}
                          </button>
                        )}
                        {apt.recordId && (
                          <span className="badge-success text-xs"><Shield className="w-3 h-3"/>On Chain</span>
                        )}
                      </div>
                    </div>

                    {/* Diagnosis Form */}
                    {isExpanded && apt.status === 'confirmed' && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-slide-up">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Diagnosis *</label>
                          <textarea className="input-field resize-none h-20 text-sm" placeholder="Enter diagnosis..."
                            value={form.diagnosis || ''}
                            onChange={e => setDiagForm(p => ({ ...p, [apt._id]: { ...p[apt._id], diagnosis: e.target.value } }))} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Prescription</label>
                          <textarea className="input-field resize-none h-16 text-sm" placeholder="Medications and instructions..."
                            value={form.prescription || ''}
                            onChange={e => setDiagForm(p => ({ ...p, [apt._id]: { ...p[apt._id], prescription: e.target.value } }))} />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => addDiagnosis(apt)} disabled={submitting === apt._id}
                            className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                            {submitting === apt._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4"/>Save & Complete</>}
                          </button>
                          <button onClick={() => setExpanded(null)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
                        </div>
                      </div>
                    )}

                    {/* Completed diagnosis view */}
                    {apt.status === 'completed' && apt.diagnosis && (
                      <div className="mt-3 p-3 bg-accent-500/10 rounded-xl border border-accent-500/20">
                        <p className="text-xs text-accent-400 font-semibold mb-1">Diagnosis</p>
                        <p className="text-sm text-gray-300">{apt.diagnosis}</p>
                        {apt.prescription && <>
                          <p className="text-xs text-primary-400 font-semibold mt-2 mb-1">Prescription</p>
                          <p className="text-sm text-gray-300">{apt.prescription}</p>
                        </>}
                      </div>
                    )}
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
