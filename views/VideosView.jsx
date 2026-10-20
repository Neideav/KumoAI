import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Video,
  Clapperboard,
  Sparkles,
  Film,
  Camera,
  Send,
  Copy,
  Check
} from 'lucide-react';
import { routeViewVariants } from '../utils/motion';

const VIDEO_TYPES = [
  { id: 'cinematic', label: 'Cinematic B-Roll', desc: 'Shot gerak lambat sinematik dengan pencahayaan dramatis.' },
  { id: 'short', label: 'Reels / TikTok Script', desc: 'Naskah video vertikal 30-60 detik dengan hook pembuka yang kuat.' },
  { id: 'storyboard', label: 'Scene-by-Scene Storyboard', desc: 'Rincian adegan demi adegan lengkap dengan arahan kamera (angle, lighting, motion).' },
  { id: 'explainer', label: 'Video Animasi Edukasi', desc: 'Naskah narasi voiceover untuk video penjelasan produk/konsep.' }
];

export default function VideosView({ onLaunchChatWithPrompt }) {
  const [concept, setConcept] = useState('');
  const [selectedType, setSelectedType] = useState(VIDEO_TYPES[0]);
  const [copied, setCopied] = useState(false);

  const videoPrompt = `Tolong buatkan konsep video ${selectedType.label} untuk tema:
"${concept.trim() || 'Peluncuran produk AI canggih di era modern'}"

Rincikan:
1. Hook visual 3 detik pertama
2. Shot List & Camera Movement (Wide shot, Close-up, Drone, Pan, Dolly)
3. Pencahayaan & Mood Suasana
4. Prompt instruksi video AI (Sora/Veo/Runway style prompt)
5. Rekomendasi Sound Design & Musik Latar`;

  const handleStartInChat = () => {
    onLaunchChatWithPrompt(videoPrompt);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(videoPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="view-container videos-view"
      variants={routeViewVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="view-header">
        <div className="view-badge">
          <Film size={16} />
          <span>Kumo Cinema & Video</span>
        </div>
        <h1 className="view-title">Studio Video & Storyboard AI</h1>
        <p className="view-subtitle">
          Susun skrip, rancang storyboard sinematik, dan buat prompt video AI beresolusi tinggi dengan mudah.
        </p>
      </div>

      <div className="view-grid-tools">
        {VIDEO_TYPES.map((type) => {
          const isActive = selectedType.id === type.id;
          return (
            <button
              key={type.id}
              className={`view-tool-card ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedType(type)}
            >
              <div className="tool-icon-box">
                <Clapperboard size={20} />
              </div>
              <div className="tool-card-content">
                <h3 className="tool-card-title">{type.label}</h3>
                <p className="tool-card-desc">{type.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="view-interactive-panel">
        <h3 className="panel-title">
          <Camera size={18} className="text-accent" />
          <span>Konsep Video</span>
        </h3>

        <div className="input-field-group">
          <label className="input-label">Ide / Cerita / Alur Video</label>
          <input
            type="text"
            className="styled-text-input"
            placeholder="Contoh: Petualangan seorang penjelajah menemukan reruntuhan kota kuno bercahaya di dasar laut..."
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStartInChat();
            }}
          />
        </div>

        <div className="prompt-preview-box">
          <div className="prompt-preview-header">
            <span className="prompt-preview-label">Rancangan Prompt Video:</span>
            <button className="prompt-copy-btn" onClick={handleCopy} title="Salin Prompt">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>
          <div className="prompt-preview-text">{videoPrompt}</div>
        </div>

        <div className="panel-actions">
          <button className="primary-action-btn" onClick={handleStartInChat}>
            <Send size={16} />
            <span>Generate Storyboard di Chat</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
