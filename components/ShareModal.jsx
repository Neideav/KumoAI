import React, { useState } from 'react';
import { X, Link2, Check, Download, FileText, Copy, Share2 } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, chat }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen || !chat) return null;

  const shareUrl = `${window.location.origin}/#chat=${chat.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyMarkdown = async () => {
    if (!chat.messages) return;
    const md = chat.messages
      .map(m => `### ${m.role === 'user' ? 'User' : 'Gemini AI'}\n\n${m.content}\n\n---\n`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(md);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadText = () => {
    if (!chat.messages) return;
    const text = `# ${chat.title || 'Percakapan Gemini'}\nTanggal: ${new Date(chat.createdAt || Date.now()).toLocaleString()}\n\n` +
      chat.messages
        .map(m => `[${m.role === 'user' ? 'USER' : 'GEMINI AI'}]:\n${m.content}\n\n`)
        .join('----------------------------------------\n\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(chat.title || 'gemini-chat').replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Share2 size={18} color="#2563eb" />
            <span>Bagikan Percakapan</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ padding: '12px 14px', background: 'var(--bg-app)', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {chat.title || 'Percakapan Tanpa Judul'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {chat.messages?.length || 0} pesan • Dibuat {new Date(chat.createdAt || Date.now()).toLocaleDateString('id-ID')}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '8px' }}>
            <label className="form-label">Tautan Publik Percakapan</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="form-input"
                style={{ fontSize: '13px', background: 'var(--bg-app)' }}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={handleCopyLink}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {copiedLink ? (
                  <>
                    <Check size={15} />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Link2 size={15} />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            <button
              type="button"
              className="share-action-row"
              onClick={handleCopyMarkdown}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Copy size={16} color="#6366f1" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-primary)' }}>
                    {copiedText ? 'Teks Markdown Berhasil Disalin!' : 'Salin sebagai Teks / Markdown'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Format siap tempel untuk dokumen & catatan
                  </div>
                </div>
              </div>
              {copiedText && <Check size={16} color="var(--success)" />}
            </button>

            <button
              type="button"
              className="share-action-row"
              onClick={handleDownloadText}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Download size={16} color="#10b981" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-primary)' }}>
                    Download Transkrip (.TXT)
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Simpan seluruh isi percakapan ke komputer Anda
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
