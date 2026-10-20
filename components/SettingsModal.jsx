import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  X,
  Moon,
  Sun,
  Palette,
  Type,
  MessageSquare,
  Trash2,
  Save,
  Bell,
  CornerDownLeft,
  ShieldCheck,
  Download,
  Info,
  Github,
  Code2,
  Sparkles,
  Check
} from 'lucide-react';
import { modalOverlayVariants, modalCardVariants } from '../utils/motion';

const TABS = [
  { id: 'tampilan', label: 'Tampilan', icon: Palette },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'privasi', label: 'Privasi', icon: ShieldCheck },
  { id: 'tentang', label: 'Tentang', icon: Info }
];

const COLOR_THEMES = [
  { id: 'monochrome', name: 'Monochrome', hex: '#171717' },
  { id: 'blue', name: 'Ocean Blue', hex: '#2563eb' },
  { id: 'purple', name: 'Nebula Purple', hex: '#7c3aed' },
  { id: 'emerald', name: 'Emerald', hex: '#059669' },
  { id: 'amber', name: 'Amber Glow', hex: '#d97706' }
];

const FONT_SIZES = [
  { id: 'small', label: 'Kecil', desc: '13px' },
  { id: 'medium', label: 'Sedang', desc: '14.5px (Standar)' },
  { id: 'large', label: 'Besar', desc: '16px' }
];

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  theme,
  onToggleTheme,
  chats = [],
  onClearAllChats
}) {
  const [activeTab, setActiveTab] = useState('tampilan');
  const [copiedLink, setCopiedLink] = useState(false);

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

  const updateSetting = (key, value) => {
    onSaveSettings({
      ...settings,
      [key]: value
    });
  };

  const handleExportAllChats = () => {
    const dataStr = JSON.stringify(chats, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kumo_all_chats_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const playChimeTest = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio not supported or blocked
    }
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
          className="modal-card settings-modal-card"
          variants={modalCardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Settings size={18} className="text-accent" />
            <span>Pengaturan Kumo</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="settings-tabs-bar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`settings-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body with Tab Contents */}
        <div className="modal-body settings-modal-body">
          {/* TAB 1: TAMPILAN */}
          {activeTab === 'tampilan' && (
            <div className="settings-tab-panel">
              {/* Dark / Light Mode */}
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Mode Tampilan</span>
                  <span className="setting-desc">Pilih antara mode terang (Light) atau mode gelap (Dark)</span>
                </div>
                <div className="setting-control-theme-toggle">
                  <button
                    type="button"
                    className={`theme-pick-btn ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => theme !== 'light' && onToggleTheme()}
                  >
                    <Sun size={15} />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    className={`theme-pick-btn ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => theme !== 'dark' && onToggleTheme()}
                  >
                    <Moon size={15} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Color Theme */}
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Tema Warna Aksen</span>
                  <span className="setting-desc">Pilih skema warna aksen antarmuka</span>
                </div>
                <div className="color-theme-palette">
                  {COLOR_THEMES.map((c) => {
                    const isSelected = (settings.colorTheme || 'monochrome') === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`color-palette-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => updateSetting('colorTheme', c.id)}
                        title={c.name}
                      >
                        <span className="color-swatch" style={{ backgroundColor: c.hex }} />
                        <span className="color-palette-name">{c.name}</span>
                        {isSelected && <Check size={14} className="palette-check" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Size */}
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Ukuran Teks</span>
                  <span className="setting-desc">Atur tingkat keterbacaan teks obrolan</span>
                </div>
                <div className="font-size-selector">
                  {FONT_SIZES.map((fs) => {
                    const isSelected = (settings.fontSize || 'medium') === fs.id;
                    return (
                      <button
                        key={fs.id}
                        type="button"
                        className={`font-size-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => updateSetting('fontSize', fs.id)}
                      >
                        <Type size={fs.id === 'small' ? 13 : fs.id === 'medium' ? 15 : 18} />
                        <span>{fs.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHAT */}
          {activeTab === 'chat' && (
            <div className="settings-tab-panel">
              {/* Save History Toggle */}
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Simpan Riwayat Percakapan</span>
                  <span className="setting-desc">Otomatis menyimpan sesi chat di browser lokal</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.saveHistory !== false}
                    onChange={(e) => updateSetting('saveHistory', e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {/* Sound Notifications */}
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Suara / Notifikasi Pesan</span>
                  <span className="setting-desc">Memutar efek suara lembut saat respons AI selesai</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="test-sound-btn"
                    onClick={playChimeTest}
                    title="Uji coba suara"
                  >
                    <Bell size={13} />
                    <span>Tes Suara</span>
                  </button>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled !== false}
                      onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>

              {/* Enter to Send */}
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Enter untuk Mengirim Pesan</span>
                  <span className="setting-desc">Gunakan Enter untuk kirim dan Shift+Enter untuk baris baru</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.enterToSend !== false}
                    onChange={(e) => updateSetting('enterToSend', e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {/* Clear History */}
              <div className="setting-row danger-zone">
                <div className="setting-info">
                  <span className="setting-label text-danger">Hapus Semua Riwayat Chat</span>
                  <span className="setting-desc">Menghapus seluruh percakapan yang tersimpan secara permanen</span>
                </div>
                <button
                  type="button"
                  className="btn-danger-outline"
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat chat? Tindakan ini tidak dapat dibatalkan.')) {
                      onClearAllChats();
                      onClose();
                    }
                  }}
                >
                  <Trash2 size={15} />
                  <span>Hapus Riwayat</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVASI */}
          {activeTab === 'privasi' && (
            <div className="settings-tab-panel">
              {/* Data Explanation */}
              <div className="privacy-info-card">
                <div className="privacy-card-header">
                  <ShieldCheck size={20} color="#059669" />
                  <h4>Bagaimana Data Anda Digunakan</h4>
                </div>
                <p className="privacy-text">
                  Kumo dirancang dengan prinsip <strong>Privacy-First</strong>:
                </p>
                <ul className="privacy-list">
                  <li>Seluruh riwayat chat dan catatan jurnal disimpan secara lokal di memori browser Anda (LocalStorage).</li>
                  <li>Data prompt hanya dikirim langsung ke endpoint resmi Google Gemini API untuk memproses respons.</li>
                  <li>Tidak ada data obrolan yang dikirimkan ke server analitik pihak ketiga atau dijual untuk periklanan.</li>
                </ul>
              </div>

              {/* Export Data */}
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Export Semua Percakapan</span>
                  <span className="setting-desc">Unduh cadangan seluruh data chat dalam format file JSON</span>
                </div>
                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={handleExportAllChats}
                >
                  <Download size={15} />
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Reset Storage */}
              <div className="setting-row danger-zone">
                <div className="setting-info">
                  <span className="setting-label text-danger">Hapus Data & Cache</span>
                  <span className="setting-desc">Bersihkan seluruh data penyimpanan lokal (chats, notes, settings)</span>
                </div>
                <button
                  type="button"
                  className="btn-danger-outline"
                  onClick={() => {
                    if (confirm('Bersihkan seluruh data dan cache lokal?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                >
                  <Trash2 size={15} />
                  <span>Reset Cache</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TENTANG */}
          {activeTab === 'tentang' && (
            <div className="settings-tab-panel about-panel">
              <div className="about-hero-box">
                <div className="about-logo-circle">
                  <Sparkles size={24} className="text-accent" />
                </div>
                <h3 className="about-app-name">Kumo AI Workspace</h3>
                <span className="about-version-badge">Versi 1.2.0 (Stable Release)</span>
                <p className="about-tagline">
                  Ruang kerja kecerdasan buatan generasi mutakhir dengan arsitektur modular, multimodal, dan performa tinggi.
                </p>
              </div>

              <div className="about-details-list">
                <div className="about-detail-item">
                  <span className="detail-key">Nama Aplikasi</span>
                  <span className="detail-val font-semibold">Kumo</span>
                </div>
                <div className="about-detail-item">
                  <span className="detail-key">Versi Rilis</span>
                  <span className="detail-val">1.2.0</span>
                </div>
                <div className="about-detail-item">
                  <span className="detail-key">Developer</span>
                  <span className="detail-val font-semibold">Kumo Core Team</span>
                </div>
                <div className="about-detail-item">
                  <span className="detail-key">Lisensi</span>
                  <span className="detail-val">MIT Open Source License</span>
                </div>
                <div className="about-detail-item">
                  <span className="detail-key">Repository GitHub</span>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="detail-link"
                  >
                    <Github size={14} />
                    <span>github.com/google/kumo</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-primary-custom" onClick={onClose}>
            Simpan & Selesai
          </button>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
