import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Mail,
  Lock,
  Sparkles,
  Shield,
  ArrowRight,
  LogOut,
  Crown,
  Check,
  Zap,
  Edit2,
  Layers,
  Star
} from 'lucide-react';
import { modalOverlayVariants, modalCardVariants } from '../utils/motion';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
];

const KUMO_TIERS = [
  {
    id: 'Kumo Basic',
    badge: 'Dasar',
    desc: 'Akses chat standar, tools belajar, dan pencarian dasar.'
  },
  {
    id: 'Kumo Pro',
    badge: 'Unggulan',
    desc: 'Akses model penalaran tinggi, respons instan & workspace tak terbatas.'
  },
  {
    id: 'Kumo Ultra',
    badge: 'Maksimal',
    desc: 'Prioritas pemrosesan tertinggi, multimodal studio & fitur eksperimental.'
  }
];

export default function AuthModal({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState(user?.name || 'Penjelajah Kumo');
  const [email, setEmail] = useState(user?.email || 'penjelajah@kumo.ai');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(user?.plan || 'Kumo Pro');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_PRESETS[0]);
  const [successMsg, setSuccessMsg] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getInitials = (n) => {
    if (!n) return 'KM';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      isLoggedIn: true,
      name: name.trim() || 'Penjelajah Kumo',
      email: email.trim() || 'penjelajah@kumo.ai',
      plan: selectedPlan,
      avatar: selectedAvatar,
      avatarInitials: getInitials(name)
    };
    onUpdateUser(updated);
    setSuccessMsg('Sesi aktif! Selamat datang kembali di Kumo.');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 800);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const updated = {
      isLoggedIn: true,
      name: name.trim() || 'Anggota Baru',
      email: email.trim() || 'user@kumo.ai',
      plan: selectedPlan,
      avatar: selectedAvatar,
      avatarInitials: getInitials(name)
    };
    onUpdateUser(updated);
    setSuccessMsg('Akun Kumo Anda berhasil didaftarkan!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 800);
  };

  const handleGoogleAuth = () => {
    const googleUser = {
      isLoggedIn: true,
      name: 'Penjelajah Kumo',
      email: 'penjelajah@kumo.ai',
      plan: 'Kumo Pro',
      avatar: AVATAR_PRESETS[0],
      avatarInitials: 'PK'
    };
    onUpdateUser(googleUser);
    setSuccessMsg('Tersambung dengan Akun Google.');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 800);
  };

  const handleLogout = () => {
    const loggedOut = {
      isLoggedIn: false,
      name: 'Tamu Kumo',
      email: 'guest@kumo.ai',
      plan: 'Kumo Basic',
      avatar: '',
      avatarInitials: 'TK'
    };
    onUpdateUser(loggedOut);
    onClose();
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      plan: selectedPlan,
      avatar: selectedAvatar,
      avatarInitials: getInitials(name)
    };
    onUpdateUser(updated);
    setSuccessMsg('Pengaturan akun berhasil disimpan.');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        variants={modalOverlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="modal-card auth-modal-card"
          variants={modalCardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={18} className="text-accent" />
            <span>
              {user.isLoggedIn
                ? 'Ruang Profil & Keanggotaan'
                : mode === 'login'
                ? 'Masuk ke Kumo'
                : 'Bergabung dengan Kumo'}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body auth-modal-body">
          {successMsg && (
            <div className="auth-alert-success">
              <Check size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {user.isLoggedIn ? (
            /* Logged in Profile View & Plan Switcher */
            <div className="profile-logged-view">
              <div className="profile-hero-card">
                <div className="profile-avatar-large">
                  {selectedAvatar ? (
                    <img src={selectedAvatar} alt={user.name} />
                  ) : (
                    <div className="avatar-fallback">{user.avatarInitials || 'PK'}</div>
                  )}
                </div>

                <div className="profile-hero-info">
                  <h3 className="profile-name-text">{user.name}</h3>
                  <span className="profile-email-text">{user.email}</span>
                  <div className="profile-badge-row">
                    <span className={`kumo-plan-badge ${user.plan === 'Kumo Ultra' ? 'ultra' : user.plan === 'Kumo Pro' ? 'pro' : 'basic'}`}>
                      <Star size={11} />
                      <span>{user.plan}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Details Form */}
              <form onSubmit={handleSaveProfile} className="auth-form-fields">
                <div className="form-group-item">
                  <label className="auth-input-label">Nama Panggilan / Identitas</label>
                  <input
                    type="text"
                    className="styled-text-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-item">
                  <label className="auth-input-label">Email Terdaftar</label>
                  <input
                    type="email"
                    className="styled-text-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Plan Tier Selector */}
                <div className="form-group-item">
                  <label className="auth-input-label">Pilihan Tingkat Layanan Kumo</label>
                  <div className="plan-selection-grid">
                    {KUMO_TIERS.map((tier) => {
                      const isChosen = selectedPlan === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          className={`plan-choice-card ${isChosen ? 'selected' : ''}`}
                          onClick={() => setSelectedPlan(tier.id)}
                        >
                          <div className="plan-choice-header">
                            <span className="plan-choice-name">{tier.id}</span>
                            {isChosen && <Check size={14} className="text-accent" />}
                          </div>
                          <span className="plan-choice-desc">{tier.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Avatar Presets */}
                <div className="form-group-item">
                  <label className="auth-input-label">Ikon Visual Profil</label>
                  <div className="avatar-preset-row">
                    {AVATAR_PRESETS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`avatar-preset-btn ${selectedAvatar === av ? 'selected' : ''}`}
                        onClick={() => setSelectedAvatar(av)}
                      >
                        <img src={av} alt={`Avatar ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="auth-action-buttons">
                  <button type="submit" className="primary-action-btn" style={{ flex: 1 }}>
                    <Edit2 size={15} />
                    <span>Perbarui Data Akun</span>
                  </button>

                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={handleLogout}
                    title="Keluar sesi"
                  >
                    <LogOut size={15} />
                    <span>Keluar</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Login & Register Form */
            <div className="auth-form-container">
              <div className="auth-mode-tabs">
                <button
                  type="button"
                  className={`auth-mode-btn ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => setMode('login')}
                >
                  Masuk Akun
                </button>
                <button
                  type="button"
                  className={`auth-mode-btn ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => setMode('register')}
                >
                  Registrasi Baru
                </button>
              </div>

              {/* Google Fast Auth */}
              <button
                type="button"
                className="btn-google-auth"
                onClick={handleGoogleAuth}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Masuk Cepat via Akun Google</span>
              </button>

              <div className="auth-divider">
                <span>atau menggunakan email Anda</span>
              </div>

              <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="auth-form-fields">
                {mode === 'register' && (
                  <div className="form-group-item">
                    <label className="auth-input-label">Nama Lengkap</label>
                    <div className="auth-input-wrapper">
                      <User size={16} className="input-inner-icon" />
                      <input
                        type="text"
                        className="styled-text-input with-icon"
                        placeholder="Nama Anda"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-group-item">
                  <label className="auth-input-label">Alamat Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="input-inner-icon" />
                    <input
                      type="email"
                      className="styled-text-input with-icon"
                      placeholder="alamat@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-item">
                  <label className="auth-input-label">Kata Sandi</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="input-inner-icon" />
                    <input
                      type="password"
                      className="styled-text-input with-icon"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="primary-action-btn auth-submit-btn">
                  <span>{mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun Kumo'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
