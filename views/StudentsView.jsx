import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  BrainCircuit,
  FileText,
  Send,
  Copy,
  Check
} from 'lucide-react';
import { routeViewVariants } from '../utils/motion';


const STUDY_TOOLS = [
  {
    id: 'explain',
    icon: HelpCircle,
    title: 'Jelaskan Konsep Sulit',
    desc: 'Ubah materi rumit menjadi analogi sederhana dan mudah dipahami.',
    promptTemplate: (topic) => `Tolong jelaskan materi "${topic}" dengan cara yang sangat mudah dipahami, gunakan analogi kehidupan sehari-hari, serta berikan contoh nyata untuk pemula.`
  },
  {
    id: 'quiz',
    icon: CheckCircle2,
    title: 'Buat Kuis & Latihan Soal',
    desc: 'Generate 5 soal latihan pilihan ganda beserta kunci jawaban & pembahasan.',
    promptTemplate: (topic) => `Buat 5 latihan soal pilihan ganda (A, B, C, D) tentang "${topic}" lengkap dengan kunci jawaban dan penjelasan mendalam untuk setiap opsi.`
  },
  {
    id: 'flashcard',
    icon: BrainCircuit,
    title: 'Ringkasan Flashcards',
    desc: 'Format poin-poin penting dalam format kartu memori siap hafalan.',
    promptTemplate: (topic) => `Rangkum konsep-konsep kunci "${topic}" ke dalam format Flashcards (Tanya - Jawab) yang padat, akurat, dan efektif untuk persiapan ujian.`
  },
  {
    id: 'paper',
    icon: FileText,
    title: 'Review & Kerangka Esai',
    desc: 'Susun outline esai, karya ilmiah, atau struktur laporan akademik.',
    promptTemplate: (topic) => `Buat outline terstruktur dan komprehensif untuk makalah ilmiah bertema "${topic}", termasuk latar belakang, rumusan masalah, poin analisa, dan kesimpulan.`
  }
];

export default function StudentsView({ onLaunchChatWithPrompt }) {
  const [selectedTool, setSelectedTool] = useState(STUDY_TOOLS[0]);
  const [subject, setSubject] = useState('');
  const [copied, setCopied] = useState(false);

  const currentPrompt = subject.trim()
    ? selectedTool.promptTemplate(subject.trim())
    : selectedTool.promptTemplate('Kalkulus / Reaksi Kimia / Hukum Termodinamika');

  const handleStartInChat = () => {
    if (!subject.trim()) {
      onLaunchChatWithPrompt(selectedTool.promptTemplate('Fisika Kuantum & Relativitas'));
    } else {
      onLaunchChatWithPrompt(currentPrompt);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="view-container student-view"
      variants={routeViewVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="view-header">
        <div className="view-badge">
          <GraduationCap size={16} />
          <span>Kumo Student Suite</span>
        </div>
        <h1 className="view-title">Asisten Belajar & Akademik</h1>
        <p className="view-subtitle">
          Tingkatkan pemahaman materi, latihan ujian, dan susun karya ilmiah secara cerdas bersama Kumo AI.
        </p>
      </div>

      <div className="view-grid-tools">
        {STUDY_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = selectedTool.id === tool.id;
          return (
            <button
              key={tool.id}
              className={`view-tool-card ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedTool(tool)}
            >
              <div className="tool-icon-box">
                <Icon size={20} />
              </div>
              <div className="tool-card-content">
                <h3 className="tool-card-title">{tool.title}</h3>
                <p className="tool-card-desc">{tool.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="view-interactive-panel">
        <h3 className="panel-title">
          <Sparkles size={18} className="text-accent" />
          <span>Konfigurasi: {selectedTool.title}</span>
        </h3>

        <div className="input-field-group">
          <label className="input-label">Materi / Topik Pembahasan / Judul Pelajaran</label>
          <input
            type="text"
            className="styled-text-input"
            placeholder="Contoh: Algoritma Dijkstra, Hukum Newton 2, Metabolisme Sel..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStartInChat();
            }}
          />
        </div>

        <div className="prompt-preview-box">
          <div className="prompt-preview-header">
            <span className="prompt-preview-label">Prompt Kumo AI Siap Pakai:</span>
            <button className="prompt-copy-btn" onClick={handleCopyPrompt} title="Salin Prompt">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>
          <div className="prompt-preview-text">{currentPrompt}</div>
        </div>

        <div className="panel-actions">
          <button className="primary-action-btn" onClick={handleStartInChat}>
            <Send size={16} />
            <span>Mulai Diskusi di Chat Kumo</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
