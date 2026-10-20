import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Search,
  Sparkles,
  Send,
  Save
} from 'lucide-react';
import { routeViewVariants } from '../utils/motion';

export default function JournalView({
  notebooks,
  onSaveNotebooks,
  onLaunchChatWithPrompt
}) {
  const [selectedId, setSelectedId] = useState(notebooks[0]?.id || null);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const activeNotebook = notebooks.find((n) => n.id === selectedId) || notebooks[0];

  const handleCreateNew = () => {
    const newEntry = {
      id: 'journal_' + Date.now(),
      title: 'Catatan Baru ' + new Date().toLocaleDateString('id-ID'),
      updatedAt: Date.now(),
      notes: ''
    };
    const updated = [newEntry, ...notebooks];
    onSaveNotebooks(updated);
    setSelectedId(newEntry.id);
    setEditTitle(newEntry.title);
    setEditNotes(newEntry.notes);
    setIsEditing(true);
  };

  const handleSaveCurrent = () => {
    if (!activeNotebook) return;
    const updated = notebooks.map((n) =>
      n.id === activeNotebook.id
        ? {
            ...n,
            title: editTitle.trim() || 'Tanpa Judul',
            notes: editNotes,
            updatedAt: Date.now()
          }
        : n
    );
    onSaveNotebooks(updated);
    setIsEditing(false);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (notebooks.length <= 1) {
      alert('Minimal harus ada 1 catatan dalam jurnal.');
      return;
    }
    const remaining = notebooks.filter((n) => n.id !== id);
    onSaveNotebooks(remaining);
    if (selectedId === id) {
      setSelectedId(remaining[0].id);
    }
  };

  const handleStartEdit = (n) => {
    setSelectedId(n.id);
    setEditTitle(n.title);
    setEditNotes(n.notes);
    setIsEditing(true);
  };

  const handleAskAIAboutNotes = () => {
    if (!activeNotebook) return;
    const prompt = `Berikut adalah catatan saya dari "Your Journal":\n\n**${activeNotebook.title}**\n${activeNotebook.notes}\n\nTolong berikan analisis mendalam, rangkuman, dan ide pengembangan lanjut terkait catatan di atas.`;
    onLaunchChatWithPrompt(prompt);
  };

  const filteredNotebooks = notebooks.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.notes && n.notes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div
      className="view-container journal-full-view"
      variants={routeViewVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="journal-sidebar-pane">
        <div className="journal-pane-header">
          <div className="view-badge">
            <BookOpen size={15} />
            <span>Your Journal</span>
          </div>
          <button className="journal-add-btn" onClick={handleCreateNew} title="Tambah Catatan">
            <Plus size={16} />
            <span>Buat Baru</span>
          </button>
        </div>

        <div className="journal-search-wrap">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="journal-search-field"
            placeholder="Cari dalam jurnal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="journal-list">
          {filteredNotebooks.map((n) => {
            const isSelected = activeNotebook && activeNotebook.id === n.id;
            return (
              <div
                key={n.id}
                className={`journal-list-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setSelectedId(n.id);
                  setEditTitle(n.title);
                  setEditNotes(n.notes);
                  setIsEditing(false);
                }}
              >
                <div className="journal-item-info">
                  <span className="journal-item-title">{n.title}</span>
                  <span className="journal-item-date">
                    {new Date(n.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <button
                  className="journal-item-del"
                  onClick={(e) => handleDelete(n.id, e)}
                  title="Hapus Catatan"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="journal-editor-pane">
        {activeNotebook ? (
          <div className="journal-editor-card">
            <div className="journal-editor-header">
              {isEditing ? (
                <input
                  type="text"
                  className="journal-title-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Judul Catatan..."
                />
              ) : (
                <h2 className="journal-display-title">{activeNotebook.title}</h2>
              )}

              <div className="journal-header-actions">
                {isEditing ? (
                  <button className="journal-save-btn" onClick={handleSaveCurrent}>
                    <Save size={15} />
                    <span>Simpan</span>
                  </button>
                ) : (
                  <button
                    className="journal-edit-btn"
                    onClick={() => handleStartEdit(activeNotebook)}
                  >
                    <Edit3 size={15} />
                    <span>Edit</span>
                  </button>
                )}

                <button
                  className="journal-ai-btn"
                  onClick={handleAskAIAboutNotes}
                  title="Diskusikan catatan ini bersama Kumo AI"
                >
                  <Sparkles size={15} />
                  <span>Analisis dengan AI</span>
                </button>
              </div>
            </div>

            <div className="journal-editor-body">
              {isEditing ? (
                <textarea
                  className="journal-textarea"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Tulis ide, rangkuman, rencana riset, atau konsep di sini..."
                />
              ) : (
                <div className="journal-rendered-content">
                  {activeNotebook.notes ? (
                    <p className="journal-text-paragraph">{activeNotebook.notes}</p>
                  ) : (
                    <div className="journal-empty-prompt">
                      <p>Catatan ini masih kosong.</p>
                      <button
                        className="journal-start-writing-btn"
                        onClick={() => handleStartEdit(activeNotebook)}
                      >
                        Mulai Menulis
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="journal-empty-view">
            <p>Pilih atau buat catatan jurnal baru.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
