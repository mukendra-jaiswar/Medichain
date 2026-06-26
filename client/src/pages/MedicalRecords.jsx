import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Shield, FileText, Calendar, Stethoscope, ChevronDown, ChevronUp,
  Loader2, CheckCircle2, AlertCircle, Copy, ExternalLink, Lock, Hash
} from 'lucide-react';
import { format } from 'date-fns';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="text-gray-500 hover:text-primary-400 transition-colors" title="Copy hash">
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [verifyResults, setVerifyResults] = useState({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const userId = user._id || user.id;
    if (!userId) {
      setLoading(false);
      return;
    }
    API.get(`/records/${userId}`)
      .then(r => setRecords(Array.isArray(r.data) ? r.data : []))
      .catch((err) => {
        if (err.response?.status === 401) {
          toast.error('Please log in to view medical records');
        } else {
          toast.error('Failed to load medical records');
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const verifyHash = async (hash, recordId) => {
    if (verifyResults[recordId]) return;
    setVerifying(recordId);
    try {
      const { data } = await API.get(`/records/verify/${hash}`);
      setVerifyResults(p => ({ ...p, [recordId]: data }));
      toast.success(data.verified ? '✅ Record verified on blockchain!' : '❌ Hash not found');
    } catch { toast.error('Verification failed'); }
    finally { setVerifying(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-accent-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white">Medical Records</h1>
          </div>
          <p className="text-gray-400 ml-15">Your health history secured with blockchain verification</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="glass-card bg-primary-500/5 border border-primary-500/20 mb-6 flex gap-4">
        <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary-300 mb-1">Blockchain-Secured Records</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Each medical record is hashed using SHA-256 and stored immutably. You can verify any record's authenticity using its unique hash.
            Records marked with <span className="text-accent-400 font-semibold">✓ Verified</span> are confirmed on the blockchain.
          </p>
        </div>
      </div>

      {/* Records */}
      {records.length === 0 ? (
        <div className="glass-card text-center py-16">
          <FileText className="w-20 h-20 text-gray-700 mx-auto mb-5" />
          <h3 className="text-xl font-semibold text-white mb-2">No medical records yet</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Records will appear here after your doctor completes an appointment and adds a diagnosis.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => {
            const isExpanded = expanded === rec.id;
            const verification = verifyResults[rec.id];

            return (
              <div key={rec.id} className={`glass-card transition-all ${rec.blockchainVerified ? 'border-emerald-500/20' : 'border-white/10'}`}>
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-white">{rec.diagnosis}</h3>
                        <p className="text-xs text-primary-300 mt-0.5">
                          Dr. {rec.doctor?.name} · {rec.doctor?.specialization}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {rec.blockchainVerified ? (
                          <span className="badge-success">
                            <Shield className="w-3 h-3" />Blockchain Secured
                          </span>
                        ) : (
                          <span className="badge-warning">
                            <AlertCircle className="w-3 h-3" />Not on Chain
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {format(new Date(rec.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Record Hash */}
                    {rec.recordHash && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-white/5 rounded-lg">
                        <Hash className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                        <code className="text-xs text-gray-500 truncate flex-1 font-mono">{rec.recordHash}</code>
                        <CopyButton text={rec.recordHash} />
                      </div>
                    )}

                    {/* Verification result */}
                    {verification && (
                      <div className={`mt-2 p-2 rounded-lg text-xs flex items-center gap-2 ${verification.verified ? 'bg-accent-500/10 text-accent-300 border border-accent-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
                        {verification.verified
                          ? <><CheckCircle2 className="w-3.5 h-3.5" />Verified on blockchain · {verification.createdAt && format(new Date(verification.createdAt), 'MMM d, yyyy HH:mm')}</>
                          : <><AlertCircle className="w-3.5 h-3.5" />Not found in blockchain records</>
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <div className="flex gap-2">
                    {rec.recordHash && !verification && (
                      <button onClick={() => verifyHash(rec.recordHash, rec.id)}
                        disabled={verifying === rec.id}
                        className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                        {verifying === rec.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                        Verify Hash
                      </button>
                    )}
                  </div>
                  <button onClick={() => setExpanded(isExpanded ? null : rec.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                    {isExpanded ? 'Less' : 'More details'}
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-slide-up">
                    {rec.prescription && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Stethoscope className="w-3.5 h-3.5 text-primary-400" />Prescription
                        </p>
                        <p className="text-sm text-gray-300 bg-white/5 rounded-xl p-3 leading-relaxed">{rec.prescription}</p>
                      </div>
                    )}
                    {rec.symptoms?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Reported Symptoms</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.symptoms.map(s => (
                            <span key={s} className="badge-primary text-xs">{s.replace(/_/g,' ')}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Date: {format(new Date(rec.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>{rec.doctor?.hospital}</span>
                      </div>
                    </div>
                    {rec.notes && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Additional Notes</p>
                        <p className="text-sm text-gray-400 italic">{rec.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-gray-700 text-xs mt-8">
        🔒 All records are SHA-256 hashed and tamper-proof via Ethereum smart contracts
      </p>
    </div>
  );
}
