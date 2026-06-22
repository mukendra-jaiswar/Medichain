import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart, Menu, X, Bell, ChevronDown, LogOut,
  LayoutDashboard, Stethoscope, Calendar, FileText, User
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, notifications, unreadCount, markNotificationRead, markAllRead } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = user ? (user.role === 'doctor' ? [
    { to: '/dashboard/doctor', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/records', icon: FileText, label: 'Records' },
  ] : [
    { to: '/dashboard/patient', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/symptoms', icon: Stethoscope, label: 'Symptom Checker' },
    { to: '/doctors', icon: User, label: 'Find Doctors' },
    { to: '/records', icon: FileText, label: 'My Records' },
  ]) : [];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">MediChain</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === to ? 'bg-primary-500/20 text-primary-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button onClick={() => setNotifOpen(p => !p)}
                    className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-fade-in z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <h3 className="font-semibold text-white text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center text-gray-500 text-sm py-8">No notifications</p>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div key={n._id}
                              onClick={() => { markNotificationRead(n._id); if (n.link) { navigate(n.link); setNotifOpen(false); } }}
                              className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.read ? 'bg-primary-500/5' : ''}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-gray-600'}`} />
                                <div>
                                  <p className={`text-xs leading-relaxed ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.message}</p>
                                  <p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(p => !p)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-300 hidden sm:block max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm px-4 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setMenuOpen(p => !p)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 pb-4 animate-slide-up">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl my-1 text-sm font-medium transition-all ${
                location.pathname === to ? 'bg-primary-500/20 text-primary-300' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
