import React from 'react';
import {
  Code2,
  Sparkles,
  GraduationCap,
  Image as ImageIcon,
  Compass,
  Lightbulb,
  FileSearch,
  PenTool
} from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    category: 'Eksplorasi Ide',
    title: 'Brainstorming Ide Inovatif',
    prompt: 'Bantu saya brainstorming 5 ide startup teknologi atau proyek AI yang relevan dan solutif di tahun ini.'
  },
  {
    icon: Code2,
    category: 'Coding & Dev',
    title: 'Troubleshoot Error & Debug',
    prompt: 'Saya menghadapi bug di kode saya. Bantu saya memahami penyebab error ini dan berikan panduan perbaikan yang rapi.'
  },
  {
    icon: GraduationCap,
    category: 'Akademik',
    title: 'Jelaskan Konsep Kompleks',
    prompt: 'Jelaskan konsep komputasi kuantum dan penerapannya secara sederhana seolah-olah saya berusia 15 tahun.'
  },
  {
    icon: PenTool,
    category: 'Kreatif',
    title: 'Tulis Konten & Copywriting',
    prompt: 'Buatkan naskah pengantar presentasi atau artikel yang menarik perhatian tentang masa depan kecerdasan buatan.'
  }
];

export default function SuggestionChips({ onSelectSuggestion }) {
  return (
    <div className="empty-state-suggestions-grid">
      {SUGGESTIONS.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            className="empty-suggestion-card"
            onClick={() => onSelectSuggestion(item.prompt)}
          >
            <div className="card-top-row">
              <span className="card-category-tag">{item.category}</span>
              <div className="card-icon-bubble">
                <Icon size={16} />
              </div>
            </div>
            <h4 className="card-heading">{item.title}</h4>
            <p className="card-snippet">{item.prompt}</p>
          </button>
        );
      })}
    </div>
  );
}
