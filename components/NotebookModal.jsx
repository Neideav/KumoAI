import React, { useState } from 'react';
import { X, BookOpen, Plus, Trash2, Edit3, Check } from 'lucide-react';

export default function NotebookModal({
  isOpen,
  onClose,
  notebooks,
  onSaveNotebooks,
  onAddNoteFromChat
}) {
  const [activeNotebookId, setActiveNotebookId] = useState(() => notebooks[0]?.id || null);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');

  if (!isOpen) return null;

  const currentNotebook = notebooks.find(n => n.id === activeNotebookId) || notebooks[0];

  const handleCreateNotebook = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newNb = {
      id: 'nb_' + Date.now(),
      title: newTitle.trim(),
      updatedAt: Date.now(),
      notes: ''
    };
    const updated = [newNb, ...notebooks];
    onSaveNotebooks(updated);
    setActiveNotebookId(newNb.id);
    setNewTitle('');
    setIsCreating(false);
  };

  const handleDeleteNotebook = (id) => {
    const updated = notebooks.filter(n => n.id !== id);
    onSaveNotebooks(updated);
    if (activeNotebookId === id) {
      setActiveNotebookId(updated[0]?.id || null);
    }
  };

  const handleSaveNotes = (id, text) => {
    const updated = notebooks.map(n => {
      if (n.id === id) {
        return { ...n, notes: text, updatedAt: Date.now() };
      }
      return n;
    });
    onSaveNotebooks(updated);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px', height: '520px', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <BookOpen size={18} color="#7c3aed" />
            <span>Your Journal & Catatan AI</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, gap: '14px', overflow: 'hidden', padding: '10px 0' }}>
          {/* Left List */}
          <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '1px solid var(--border-subtle)', paddingRight: '10px' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '6px 10px', fontSize: '12.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}
              onClick={() => setIsCreating(true)}
            >
              <Plus size={14} />
              <span>New Journal</span>
            </button>

            {isCreating && (
              <form onSubmit={handleCreateNotebook} style={{ marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Nama journal..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '12px', padding: '6px 8px' }}
                  autoFocus
                />
              </form>
            )}

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {notebooks.map(nb => (
                <div
                  key={nb.id}
                  className={`history-item ${nb.id === currentNotebook?.id ? 'active' : ''}`}
                  onClick={() => setActiveNotebookId(nb.id)}
                  style={{ fontSize: '12.5px', padding: '8px 10px' }}
                >
                  <span className="history-title">{nb.title}</span>
                  <div className="history-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="history-act-btn delete"
                      onClick={() => handleDeleteNotebook(nb.id)}
                      title="Hapus journal"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Notes Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentNotebook ? (
              <>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                  {currentNotebook.title}
                </div>
                <textarea
                  className="form-textarea"
                  style={{ flex: 1, resize: 'none', fontSize: '13px', lineHeight: 1.6, padding: '12px' }}
                  placeholder="Tulis ide, refleksi, sintesis percakapan, atau catatan penting di sini..."
                  value={currentNotebook.notes || ''}
                  onChange={(e) => handleSaveNotes(currentNotebook.id, e.target.value)}
                />
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                Pilih atau buat journal baru
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: 'auto' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
