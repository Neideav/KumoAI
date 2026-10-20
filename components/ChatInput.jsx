import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Paperclip,
  HardDrive,
  Globe,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Check,
  ArrowUp,
  Square,
  X,
  Image as ImageIcon,
  Video,
  Music,
  LayoutTemplate,
  GraduationCap,
  Wrench,
  MoreHorizontal
} from 'lucide-react';
import { GEMINI_MODELS } from '../services/geminiService';
import { dropdownVariants } from '../utils/motion';

export default function ChatInput({
  input,
  setInput,
  onSend,
  onStop,
  isLoading,
  attachment,
  setAttachment,
  isDeepSearch,
  setIsDeepSearch,
  isReasoning,
  setIsReasoning,
  currentModel,
  onSelectModel,
  onModelChange,
  onOpenSettings,
  enterToSend = true
}) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const modelMenuRef = useRef(null);
  const toolsMenuRef = useRef(null);

  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  const currentModelObj = GEMINI_MODELS.find(m => m.id === currentModel) || GEMINI_MODELS[0];

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) {
        setIsModelMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target)) {
        setIsToolsMenuOpen(false);
      }
    };
    if (isModelMenuOpen || isToolsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModelMenuOpen, isToolsMenuOpen]);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isModelMenuOpen) setIsModelMenuOpen(false);
        if (isToolsMenuOpen) setIsToolsMenuOpen(false);
      }
    };
    if (isModelMenuOpen || isToolsMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModelMenuOpen, isToolsMenuOpen]);

  const handleKeyDown = (e) => {
    if (enterToSend !== false) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if ((input.trim() || attachment) && !isLoading) {
          onSend();
        }
      }
    } else {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if ((input.trim() || attachment) && !isLoading) {
          onSend();
        }
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar (JPEG, PNG, WebP) yang didukung untuk saat ini.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        name: file.name,
        type: file.type,
        data: event.target.result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleToolAction = (actionType) => {
    setIsToolsMenuOpen(false);
    switch (actionType) {
      case 'upload':
        fileInputRef.current?.click();
        break;
      case 'drive':
        setInput('Integrasi Google Workspace / Drive: Analisis materi berikut: ');
        textareaRef.current?.focus();
        break;
      case 'image':
        setInput('Buatkan prompt gambar mendetail untuk: ');
        textareaRef.current?.focus();
        break;
      case 'video':
        setInput('Rancang konsep storyboard dan skrip video untuk: ');
        textareaRef.current?.focus();
        break;
      case 'music':
        setInput('Tuliskan konsep lagu, bait lirik, dan aransemen musik untuk genre: ');
        textareaRef.current?.focus();
        break;
      case 'canvas':
        setInput('Buka mode Canvas interaktif dan bantu saya merancang proyek berikut: ');
        textareaRef.current?.focus();
        break;
      case 'research':
        setIsDeepSearch(true);
        setInput('Lakukan riset mendalam multi-sumber mengenai: ');
        textareaRef.current?.focus();
        break;
      case 'learning':
        setIsReasoning(true);
        setInput('Bertindaklah sebagai tutor ahli. Bimbing saya belajar langkah demi langkah tentang: ');
        textareaRef.current?.focus();
        break;
      default:
        break;
    }
  };


  return (
    <div className="chat-input-wrapper">
      <div className="chat-input-container">
        <div className="input-card">
          {/* Attachment Preview Chip */}
          {attachment && (
            <div className="attachment-chip-row">
              <div className="attachment-chip">
                <ImageIcon size={14} />
                <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attachment.name}
                </span>
                <button
                  className="attachment-chip-remove"
                  onClick={() => setAttachment(null)}
                  title="Remove image"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask anything"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />

          {/* Bottom Toolbar inside Card */}
          <div className="input-toolbar">
            <div className="input-tools-left">
              {/* Plus Button with Rich Tools & Uploads Popover */}
              <div className="tools-menu-wrapper" ref={toolsMenuRef}>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  className={`tool-icon-btn plus-btn ${isToolsMenuOpen ? 'active' : ''}`}
                  onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                  title="Upload & Fitur Tambahan"
                  aria-expanded={isToolsMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Upload dan fitur tambahan"
                >
                  <Plus size={18} strokeWidth={2.2} style={{ transform: isToolsMenuOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                </motion.button>

                <AnimatePresence>
                  {isToolsMenuOpen && (
                    <motion.div
                      className="tools-dropdown-menu"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      role="menu"
                    >
                      <button
                        type="button"
                        className="tools-dropdown-item"
                        onClick={() => handleToolAction('upload')}
                        role="menuitem"
                      >
                        <Paperclip size={16} />
                        <span>Upload files</span>
                      </button>

                      <button
                        type="button"
                        className="tools-dropdown-item"
                        onClick={() => handleToolAction('drive')}
                        role="menuitem"
                      >
                        <HardDrive size={16} />
                        <span>Add from Drive</span>
                      </button>

                      <button
                        type="button"
                        className="tools-dropdown-item"
                        onClick={() => handleToolAction('upload')}
                        role="menuitem"
                      >
                        <MoreHorizontal size={16} />
                        <span style={{ flex: 1, textAlign: 'left' }}>More uploads</span>
                        <ChevronRight size={14} color="var(--text-muted)" />
                      </button>

                      <div className="tools-dropdown-divider" />

                      <button
                        type="button"
                        className="tools-dropdown-item"
                        onClick={() => handleToolAction('image')}
                        role="menuitem"
                      >
                        <ImageIcon size={16} color="#7c3aed" />
                        <span>Create image</span>
                      </button>

                      <button
                        type="button"
                        className="tools-dropdown-item"
                        onClick={() => handleToolAction('video')}
                        role="menuitem"
                      >
                        <Video size={16} color="#2563eb" />
                        <span>Create video</span>
                      </button>

                      <button
                        type="button"
                        className="tools-dropdown-item"
                        onClick={() => handleToolAction('music')}
                        role="menuitem"
                      >
                        <Music size={16} color="#db2777" />
                        <span>Create music</span>
                      </button>

                      <button
                        type="button"
                        className="tools-dropdown-item"
                        onClick={() => handleToolAction('canvas')}
                        role="menuitem"
                      >
                        <LayoutTemplate size={16} color="#059669" />
                        <span>Canvas</span>
                      </button>

                      <button
                        type="button"
                        className="tools-dropdown-item"
                        onClick={() => handleToolAction('research')}
                        role="menuitem"
                      >
                        <Globe size={16} color="#d97706" />
                        <span>Deep research</span>
                      </button>

                      <button
                        type="button"
                        className="tools-dropdown-item"
                        onClick={() => handleToolAction('learning')}
                        role="menuitem"
                      >
                        <GraduationCap size={16} color="#4f46e5" />
                        <span>Guided learning</span>
                      </button>

                      <button
                        type="button"
                        className="tools-dropdown-item"
                        onClick={() => handleToolAction('research')}
                        role="menuitem"
                      >
                        <Wrench size={16} color="var(--text-muted)" />
                        <span style={{ flex: 1, textAlign: 'left' }}>More tools</span>
                        <ChevronRight size={14} color="var(--text-muted)" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Deep Search Pill */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                className={`tool-pill-btn ${isDeepSearch ? 'active search' : ''}`}
                onClick={() => setIsDeepSearch(!isDeepSearch)}
                title="Toggle Deep Search"
                aria-pressed={isDeepSearch}
              >
                <Globe size={15} />
                <span>Deep Search</span>
              </motion.button>

              {/* Reason Pill */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                className={`tool-pill-btn ${isReasoning ? 'active reason' : ''}`}
                onClick={() => setIsReasoning(!isReasoning)}
                title="Toggle Reasoning / Thinking Mode"
                aria-pressed={isReasoning}
              >
                <Lightbulb size={15} />
                <span>Reason</span>
              </motion.button>

              {/* Model Choice Dropdown (Replacing 3-dots) */}
              <div className="model-menu-wrapper" ref={modelMenuRef}>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  className={`tool-pill-btn model-select-pill ${isModelMenuOpen ? 'active' : ''}`}
                  onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                  title="Pilih Model Gemini"
                  aria-expanded={isModelMenuOpen}
                  aria-haspopup="listbox"
                  aria-label="Pilih model Gemini"
                >
                  <Sparkles size={14} color="#6366f1" />
                  <span>{currentModelObj?.name || 'Gemini 3.6 Flash'}</span>
                  <ChevronDown
                    size={12}
                    style={{
                      transform: isModelMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </motion.button>

                <AnimatePresence>
                  {isModelMenuOpen && (
                    <motion.div
                      className="model-dropdown-menu"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      role="listbox"
                    >
                      <div className="model-dropdown-header">
                        <span>PILIH MODEL GEMINI</span>
                      </div>
                      <div className="model-dropdown-list">
                        {GEMINI_MODELS.map((m) => {
                          const isSelected = currentModel === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              className={`model-dropdown-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                if (onSelectModel) onSelectModel(m.id);
                                if (onModelChange) onModelChange(m.id);
                                setIsModelMenuOpen(false);
                              }}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <div className="model-dropdown-item-info">
                                <div className="model-dropdown-item-title-row">
                                 <span className="model-dropdown-name">{m.name}</span>
                                 <span className="model-dropdown-badge">{m.badge}</span>
                                </div>
                                <span className="model-dropdown-desc">{m.desc}</span>
                              </div>
                              {isSelected && <Check size={16} color="#2563eb" style={{ flexShrink: 0 }} />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Send or Stop Generation Button */}
            {isLoading ? (
              <motion.button
                whileTap={{ scale: 0.94 }}
                className="btn-send-message btn-stop-message"
                onClick={onStop}
                title="Hentikan respons (Stop)"
                aria-label="Hentikan respons"
                type="button"
              >
                <Square size={13} fill="currentColor" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.94 }}
                className="btn-send-message"
                onClick={onSend}
                disabled={(!input.trim() && !attachment) || isLoading}
                title="Kirim pesan (Enter)"
                aria-label="Kirim pesan"
                type="button"
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Footer Disclaimer matching reference mockup */}
        <div className="footer-disclaimer-wrapper">
          <div className="plan-limit-pill">
            Powered by Kumo AI
          </div>
          <div className="footer-disclaimer-text">
            AI can make mistakes. Please double-check responses.
          </div>
        </div>
      </div>
    </div>
  );
}
