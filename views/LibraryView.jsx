import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Library,
  Bookmark,
  Search,
  Code2,
  PenTool,
  Brain,
  Rocket,
  Sparkles,
  Send,
  Copy,
  Check,
  Plus,
  Trash2,
  Star,
  GraduationCap,
  Layers,
  Filter,
  X
} from 'lucide-react';
import { routeViewVariants } from '../utils/motion';
import { getCustomPrompts, saveCustomPrompts } from '../utils/storage';

const SYSTEM_TEMPLATES = [
  {
    category: 'Coding & Arsitektur',
    icon: Code2,
    items: [
      {
        id: 'sys_1',
        title: 'Refactor Clean Code & Performa',
        desc: 'Review kode untuk meningkatkan performa, time complexity, dan struktur modular.',
        prompt: 'Tolong review dan refactor potongan kode berikut. Fokus pada best practices, time complexity, pembersihan kode redundan, dan penulisan modular yang bersih:\n\n```js\n// Masukkan kode Anda di sini\n```',
        isCustom: false
      },
      {
        id: 'sys_2',
        title: 'Debug & Analisis Akar Masalah (RCA)',
        desc: 'Identifikasi penyebab bug, stack trace error, dan berikan solusi langkah demi langkah.',
        prompt: 'Saya mengalami bug/error berikut:\n[Masukkan pesan error]\n\nBerikut konteks kodenya:\n[Masukkan kode]\n\nTolong jelaskan akar masalah (root cause) dan berikan perbaikan lengkap langkah demi langkah.',
        isCustom: false
      },
      {
        id: 'sys_3',
        title: 'Generator Komponen React & Desain Modern',
        desc: 'Buat komponen React fungsional dengan pure CSS modern dan interaktivitas.',
        prompt: 'Buatkan komponen React modern lengkap dengan state management, hook interaktif, dan styling pure CSS responsif bertema [Tema Desain].',
        isCustom: false
      }
    ]
  },
  {
    category: 'Penulisan & Konten',
    icon: PenTool,
    items: [
      {
        id: 'sys_4',
        title: 'Copywriting Landing Page Memikat',
        desc: 'Formula copywriting AIDA / PAS untuk konversi pembaca yang tinggi.',
        prompt: 'Buatkan naskah copywriting landing page dengan struktur AIDA (Attention, Interest, Desire, Action) untuk produk berikut:\n[Nama & Deskripsi Produk]\n\nTarget Audiens: [Target Pembeli]\nTone: Profesional, modern, meyakinkan.',
        isCustom: false
      },
      {
        id: 'sys_5',
        title: 'Artikel Blog SEO-Optimized Mendalam',
        desc: 'Buat artikel 1200+ kata lengkap dengan heading structure H2/H3 dan FAQ section.',
        prompt: 'Tulis artikel blog komprehensif 1200+ kata dengan target kata kunci "[Keyword Target]". Buat struktur heading yang jelas, FAQ section, dan tips praktis yang actionable.',
        isCustom: false
      }
    ]
  },
  {
    category: 'Riset & Akademik',
    icon: GraduationCap,
    items: [
      {
        id: 'sys_6',
        title: 'Sintesis Literatur & Ringkasan Paper',
        desc: 'Rangkum abstrak, metodologi, temuan kunci, dan limitasi studi ilmiah.',
        prompt: 'Tolong buatkan ringkasan analitis dan sintesis komprehensif mengenai materi/paper ini:\n[Masukkan teks materi/abstrak]\n\nSertakan: Poin Utama, Metodologi, Temuan Kunci, dan Implikasi Praktis.',
        isCustom: false
      },
      {
        id: 'sys_7',
        title: 'Kuis & Pembahasan Konsep Mendalam',
        desc: 'Generate 5 soal studi kasus dengan penjelasan mendalam untuk persiapan ujian.',
        prompt: 'Buatkan 5 soal studi kasus tingkat menengah-lanjut mengenai [Topik Pembahasan] lengkap dengan rubrik jawaban dan analisis mengapa setiap opsi benar atau salah.',
        isCustom: false
      }
    ]
  },
  {
    category: 'Strategi & Bisnis',
    icon: Rocket,
    items: [
      {
        id: 'sys_8',
        title: 'Brainstorming Ide Inovatif (First-Principles)',
        desc: 'Eksplorasi solusi dari sudut pandang fundamental yang jarang dipikirkan orang.',
        prompt: 'Lakukan sesi brainstorming menggunakan pendekatan First-Principles thinking untuk memecahkan tantangan berikut:\n[Jelaskan tantangan/masalah]\n\nBerikan 5 sudut pandang unik yang inovatif.',
        isCustom: false
      },
      {
        id: 'sys_9',
        title: 'Penyusunan Rencana Aksi (Action Plan)',
        desc: 'Roadmap bertahap 4 minggu dengan to-do list spesifik dan indikator pencapaian.',
        prompt: 'Susun rencana aksi 4 minggu terstruktur untuk mencapai tujuan ini:\n[Tujuan Proyek]\n\nBagi menjadi jadwal mingguan dengan to-do list spesifik dan indikator keberhasilan.',
        isCustom: false
      }
    ]
  }
];

export default function LibraryView({ onLaunchChatWithPrompt }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [copiedId, setCopiedId] = useState(null);
  const [customPrompts, setCustomPrompts] = useState(() => getCustomPrompts());
  const [showAddModal, setShowAddModal] = useState(false);

  // New prompt form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Coding & Arsitektur');
  const [newDesc, setNewDesc] = useState('');
  const [newPromptText, setNewPromptText] = useState('');

  // Persist custom prompts
  useEffect(() => {
    saveCustomPrompts(customPrompts);
  }, [customPrompts]);

  const categories = [
    'Semua',
    'Coding & Arsitektur',
    'Penulisan & Konten',
    'Riset & Akademik',
    'Strategi & Bisnis',
    'Template Kustom Anda'
  ];

  // Combine system + custom prompts
  const allCategories = SYSTEM_TEMPLATES.map((cat) => {
    const matchingCustom = customPrompts.filter((cp) => cp.category === cat.category);
    return {
      ...cat,
      items: [...cat.items, ...matchingCustom]
    };
  });

  if (customPrompts.length > 0) {
    const otherCustom = customPrompts.filter(
      (cp) => !SYSTEM_TEMPLATES.some((st) => st.category === cp.category)
    );
    if (otherCustom.length > 0) {
      allCategories.push({
        category: 'Template Kustom Anda',
        icon: Star,
        items: otherCustom
      });
    }
  }

  const handleCopy = (prompt, id) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreatePrompt = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPromptText.trim()) return;

    const newEntry = {
      id: 'custom_' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      desc: newDesc.trim() || 'Template prompt kustom Anda.',
      prompt: newPromptText.trim(),
      isCustom: true
    };

    setCustomPrompts((prev) => [newEntry, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setNewPromptText('');
    setShowAddModal(false);
  };

  const handleDeleteCustom = (id, e) => {
    e.stopPropagation();
    if (confirm('Hapus template kustom ini?')) {
      setCustomPrompts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Filter items by category & search query
  const filteredSections = allCategories
    .map((cat) => {
      if (activeCategory !== 'Semua' && activeCategory !== 'Template Kustom Anda' && cat.category !== activeCategory) {
        return null;
      }
      if (activeCategory === 'Template Kustom Anda') {
        const customOnly = cat.items.filter((item) => item.isCustom);
        if (customOnly.length === 0) return null;
        return {
          ...cat,
          items: customOnly.filter(
            (item) =>
              item.title.toLowerCase().includes(search.toLowerCase()) ||
              item.desc.toLowerCase().includes(search.toLowerCase()) ||
              item.prompt.toLowerCase().includes(search.toLowerCase())
          )
        };
      }

      const filteredItems = cat.items.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.desc.toLowerCase().includes(search.toLowerCase()) ||
          item.prompt.toLowerCase().includes(search.toLowerCase())
      );

      if (filteredItems.length === 0) return null;

      return {
        ...cat,
        items: filteredItems
      };
    })
    .filter(Boolean);

  return (
    <motion.div
      className="view-container library-view"
      variants={routeViewVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="view-header">
        <div className="view-header-top-row">
          <div>
            <div className="view-badge">
              <Library size={16} />
              <span>Kumo Knowledge & Prompt Library</span>
            </div>
            <h1 className="view-title">Pustaka Prompt & Modul Pintar</h1>
            <p className="view-subtitle">
              Koleksi template instruksi teruji dan modul cerdas untuk mempercepat alur kerja coding, riset, penulisan, dan kreasi Anda.
            </p>
          </div>

          <button
            type="button"
            className="primary-action-btn add-prompt-header-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>Tambah Template</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="library-search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="library-search-input"
            placeholder="Cari dalam pustaka (misal: coding, SEO, debug, analisis, strategi)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="library-category-chips">
          {categories.map((catName) => (
            <button
              key={catName}
              type="button"
              className={`lib-chip-btn ${activeCategory === catName ? 'active' : ''}`}
              onClick={() => setActiveCategory(catName)}
            >
              {catName === 'Template Kustom Anda' && <Star size={13} style={{ marginRight: '4px' }} />}
              <span>{catName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="library-sections">
        {filteredSections.length === 0 ? (
          <div className="library-empty-state">
            <Bookmark size={36} color="var(--text-muted)" />
            <p>Tidak ada template yang cocok dengan pencarian Anda.</p>
            {activeCategory === 'Template Kustom Anda' && (
              <button className="primary-action-btn" onClick={() => setShowAddModal(true)} style={{ marginTop: '10px' }}>
                <Plus size={15} />
                <span>Buat Template Kustom Pertama</span>
              </button>
            )}
          </div>
        ) : (
          filteredSections.map((category, catIdx) => {
            const CatIcon = category.icon || Sparkles;
            return (
              <div key={catIdx} className="library-category-group">
                <div className="category-header">
                  <CatIcon size={18} className="text-accent" />
                  <h2 className="category-title">{category.category}</h2>
                </div>

                <div className="library-grid">
                  {category.items.map((item) => {
                    const isCopied = copiedId === item.id;
                    return (
                      <div key={item.id} className="library-card">
                        <div className="library-card-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {item.isCustom && <Star size={13} color="#d97706" />}
                            <h3 className="library-item-title">{item.title}</h3>
                          </div>

                          <div className="card-quick-actions">
                            <button
                              className="icon-mini-btn"
                              onClick={() => handleCopy(item.prompt, item.id)}
                              title="Salin Prompt"
                            >
                              {isCopied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                            </button>

                            {item.isCustom && (
                              <button
                                className="icon-mini-btn danger"
                                onClick={(e) => handleDeleteCustom(item.id, e)}
                                title="Hapus Template Kustom"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="library-item-desc">{item.desc}</p>

                        <div className="library-card-footer">
                          <button
                            className="use-prompt-btn"
                            onClick={() => onLaunchChatWithPrompt(item.prompt)}
                            title="Mulai chat dengan prompt ini"
                          >
                            <Send size={13} />
                            <span>Gunakan di Chat</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Prompt Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Plus size={18} className="text-accent" />
                <span>Tambah Template Prompt Kustom</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePrompt}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group-item">
                  <label className="auth-input-label">Judul Template</label>
                  <input
                    type="text"
                    className="styled-text-input"
                    placeholder="Contoh: Generator Unit Test Jest"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-item">
                  <label className="auth-input-label">Kategori</label>
                  <select
                    className="styled-text-input"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Coding & Arsitektur">Coding & Arsitektur</option>
                    <option value="Penulisan & Konten">Penulisan & Konten</option>
                    <option value="Riset & Akademik">Riset & Akademik</option>
                    <option value="Strategi & Bisnis">Strategi & Bisnis</option>
                    <option value="Kustom Pribadi">Kustom Pribadi</option>
                  </select>
                </div>

                <div className="form-group-item">
                  <label className="auth-input-label">Deskripsi Singkat</label>
                  <input
                    type="text"
                    className="styled-text-input"
                    placeholder="Contoh: Membuat test case otomatis untuk fungsi async"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>

                <div className="form-group-item">
                  <label className="auth-input-label">Instruksi Prompt Lengkap</label>
                  <textarea
                    className="styled-textarea"
                    rows={4}
                    placeholder="Tuliskan prompt AI yang ingin disimpan..."
                    value={newPromptText}
                    onChange={(e) => setNewPromptText(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="primary-action-btn">
                  <Bookmark size={15} />
                  <span>Simpan ke Pustaka</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
