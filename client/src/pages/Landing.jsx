import { Link } from 'react-router-dom';
import { Heart, Brain, MapPin, Shield, ArrowRight, Stethoscope, Calendar, FileText, ChevronRight, Activity, Lock, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon: Icon, title, desc, color }) => (
  <div className="glass-card group cursor-default">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const StepCard = ({ num, title, desc, icon: Icon }) => (
  <div className="flex gap-4 items-start group">
    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-900/40 group-hover:scale-110 transition-transform">
      {num}
    </div>
    <div className="pt-1">
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const StatPill = ({ value, label }) => (
  <div className="glass rounded-2xl px-6 py-4 text-center">
    <div className="text-3xl font-bold gradient-text">{value}</div>
    <div className="text-gray-400 text-sm mt-1">{label}</div>
  </div>
);

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-32">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-primary-300 mb-8 border border-primary-500/30">
            <Zap className="w-4 h-4 text-yellow-400" />
            AI-Powered · Blockchain Secured · Doctor Verified
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white leading-tight mb-6">
            Your Health,<br />
            <span className="gradient-text">Intelligently</span><br />
            Managed
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Enter your symptoms, get AI-powered disease predictions, find the right specialist near you, and keep your medical records forever secured on the Ethereum blockchain.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            {user ? (
              <Link to={user.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient'}
                className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary flex items-center gap-2 text-lg px-8 py-4">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 justify-center">
            <StatPill value="40+" label="Diseases Detected" />
            <StatPill value="132" label="Symptoms Analyzed" />
            <StatPill value="24+" label="Specialists Available" />
            <StatPill value="100%" label="Blockchain Secured" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Five simple steps from symptom to secure medical record</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <StepCard num="1" icon={Activity} title="Enter Symptoms" desc="Select from 132 known symptoms using our smart searchable multi-select interface." />
          <StepCard num="2" icon={Brain} title="AI Diagnosis" desc="Our Random Forest ML model predicts your condition with confidence scoring." />
          <StepCard num="3" icon={MapPin} title="Find Specialists" desc="Get matched to the right specialist type and see doctors near you on an interactive map." />
          <StepCard num="4" icon={Calendar} title="Book Appointment" desc="Pick an available time slot and instantly book with your chosen doctor." />
          <StepCard num="5" icon={FileText} title="Get Diagnosis" desc="Doctor adds prescription and diagnosis after your appointment." />
          <StepCard num="6" icon={Shield} title="Blockchain Record" desc="Your complete medical record is hashed and permanently stored on Ethereum." />
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose MediChain?</h2>
          <p className="text-gray-400 text-lg">Enterprise-grade features for everyone</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={Brain} color="bg-gradient-to-br from-violet-600 to-primary-600"
            title="AI Symptom Analysis" desc="Machine learning model trained on 4800+ samples across 41 diseases with 95%+ accuracy." />
          <FeatureCard icon={MapPin} color="bg-gradient-to-br from-blue-600 to-cyan-500"
            title="Geolocation Matching" desc="MongoDB geospatial queries find the nearest verified doctors within your city." />
          <FeatureCard icon={Shield} color="bg-gradient-to-br from-emerald-600 to-accent-500"
            title="Blockchain Records" desc="Medical records hashed with SHA-256 and stored immutably via Ethereum smart contracts." />
          <FeatureCard icon={Lock} color="bg-gradient-to-br from-amber-600 to-orange-500"
            title="Access Control" desc="You control who sees your records. Grant or revoke doctor access at any time." />
          <FeatureCard icon={Calendar} color="bg-gradient-to-br from-pink-600 to-rose-500"
            title="Smart Scheduling" desc="Real-time slot availability with conflict detection prevents double-bookings." />
          <FeatureCard icon={Stethoscope} color="bg-gradient-to-br from-indigo-600 to-purple-600"
            title="Verified Doctors" desc="24 specialist doctors across 8 major Indian cities, all with verified credentials." />
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto glass-card text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-500/10 pointer-events-none" />
          <Heart className="w-16 h-16 text-primary-400 mx-auto mb-6" fill="currentColor" />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to take control of your health?</h2>
          <p className="text-gray-400 mb-8 text-lg">Join thousands using AI and blockchain for smarter healthcare.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Start for Free <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-8 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-primary-500" fill="currentColor" />
          <span className="gradient-text font-semibold">MediChain</span>
        </div>
        <p>Built with React · Node.js · Python/Flask · Ethereum · MongoDB</p>
      </footer>
    </div>
  );
}
