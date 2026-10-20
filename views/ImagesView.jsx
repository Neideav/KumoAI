import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Image as ImageIcon,
  Sparkles,
  Layers,
  Ratio,
  Sliders,
  Send,
  Copy,
  Check,
  Palette
} from 'lucide-react';
import { routeViewVariants } from '../utils/motion';

const STYLE_PRESETS = [
  { id: 'cinematic', label: 'Cinematic Photorealistic', tag: '8k resolution, cinematic lighting, photorealistic, Unreal Engine 5 render, depth of field' },
  { id: 'anime', label: 'Anime & Manga (Makoto Shinkai)', tag: 'vibrant anime aesthetic, Makoto Shinkai style, intricate details, glowing sky, 4k' },
  { id: 'cyberpunk', label: 'Cyberpunk & Neon Sci-Fi', tag: 'cyberpunk city, neon lighting, volumetric fog, dark sci-fi aesthetic, detailed reflections' },
  { id: 'isometric', label: '3D Isometric Diorama', tag: 'cute 3d isometric room, soft pastel lighting, blender 3d render, clay style, miniature' },
  { id: 'watercolor', label: 'Aquarelle / Watercolor', tag: 'delicate watercolor illustration, paper texture, dreamy soft brush strokes, artistic' }
];

const ASPECT_RATIOS = ['1:1 Square', '16:9 Landscape', '9:16 Portrait', '4:3 Standard', '21:9 Ultrawide'];

export default function ImagesView({ onLaunchChatWithPrompt }) {
  const [promptInput, setPromptInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0]);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[1]);
  const [copied, setCopied] = useState(false);

  const fullPrompt = `Buatkan gambar berkualitas tinggi dengan deskripsi berikut:\n"${promptInput.trim() || 'Pemandangan kota futuristik di atas awan dengan arsitektur organik terapung'}"\n\nGaya Visual: ${selectedStyle.label} (${selectedStyle.tag})\nAspek Rasio: ${selectedRatio}\nDetail tambahan: Ultra-detailed, masterpiece, aesthetic composition.`;

  const handleStartInChat = () => {
    onLaunchChatWithPrompt(fullPrompt);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="view-container images-view"
      variants={routeViewVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="view-header">
        <div className="view-badge">
          <ImageIcon size={16} />
          <span>Kumo Image Studio</span>
        </div>
        <h1 className="view-title">Studio Prompt Gambar & Visual AI</h1>
        <p className="view-subtitle">
          Rancang instruksi visual fotorealistik, anime, atau 3D render tingkat lanjut untuk menghasilkan visual memukau.
        </p>
      </div>

      <div className="view-interactive-panel">
        <div className="input-field-group">
          <label className="input-label">Ide Visual / Deskripsi Objek</label>
          <textarea
            className="styled-textarea"
            rows={3}
            placeholder="Contoh: Kucing astronot mengenakan helm kaca bercahaya, melayang di dekat cincin Saturnus..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
          />
        </div>

        <div className="options-row">
          <div className="option-col">
            <label className="input-label">
              <Palette size={14} />
              <span>Gaya Artistik (Style Preset)</span>
            </label>
            <div className="chips-selector">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  className={`selector-chip ${selectedStyle.id === style.id ? 'active' : ''}`}
                  onClick={() => setSelectedStyle(style)}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="option-col">
            <label className="input-label">
              <Ratio size={14} />
              <span>Aspek Rasio</span>
            </label>
            <div className="chips-selector">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  className={`selector-chip ${selectedRatio === ratio ? 'active' : ''}`}
                  onClick={() => setSelectedRatio(ratio)}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="prompt-preview-box">
          <div className="prompt-preview-header">
            <span className="prompt-preview-label">Prompt Visual Siap Kirim:</span>
            <button className="prompt-copy-btn" onClick={handleCopy} title="Salin Prompt">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>
          <div className="prompt-preview-text">{fullPrompt}</div>
        </div>

        <div className="panel-actions">
          <button className="primary-action-btn" onClick={handleStartInChat}>
            <Send size={16} />
            <span>Generate Visual dengan Kumo</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
