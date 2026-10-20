import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PanelLeft,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
  Edit3,
  GraduationCap,
  Image as ImageIcon,
  Video,
  Library,
  BookOpen,
  Pin,
  MoreHorizontal,
  Share2,
  Download,
  FileText,
  MessageSquare
} from 'lucide-react';
import { dropdownVariants } from '../utils/motion';

export default function Sidebar({
  isOpen,
  onToggle,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePinChat,
  notebooks = [],
  activeRoute = 'chat',
  onRouteChange,
  onOpenShareModal,
  onOpenSettings,
  user = { isLoggedIn: true, name: 'Nauvaldy Maulana', email: 'nauvaldymaulana@gmail.com', plan: 'Plus', avatar: '', avatarInitials: 'NM' },
  onOpenAuthModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [openMenuChatId, setOpenMenuChatId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const menuRef = useRef(null);

  // Close context menu on outside click or Escape key
  useEffect(() => {
    const handleDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuChatId(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenMenuChatId(null);
      }
    };
    if (openMenuChatId) {
      document.addEventListener('mousedown', handleDocClick);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuChatId]);


  // Sort chats: Pinned first, then by updatedAt desc
  const sortedChats = [...chats].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  const filteredChats = sortedChats.filter(chat =>
    (chat.title || 'Percakapan Baru').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (chat) => {
    setEditingChatId(chat.id);
    setRenameValue(chat.title || 'Percakapan Baru');
    setOpenMenuChatId(null);
  };

  const handleSaveRename = (id) => {
    if (renameValue.trim()) {
      onRenameChat(id, renameValue.trim());
    }
    setEditingChatId(null);
  };

  const handleExportDocs = (chat) => {
    if (!chat.messages) return;
    const content = `# ${chat.title}\n\n` + chat.messages.map(m => `**${m.role === 'user' ? 'User' : 'Kumo AI'}**:\n${m.content}\n`).join('\n---\n\n');
    navigator.clipboard.writeText(content);
    alert('Format Docs/Markdown berhasil disalin ke clipboard!');
    setOpenMenuChatId(null);
  };

  const handleDownloadText = (chat) => {
    if (!chat.messages) return;
    const text = `# ${chat.title}\n\n` + chat.messages.map(m => `[${m.role === 'user' ? 'USER' : 'KUMO AI'}]:\n${m.content}\n\n`).join('---\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(chat.title || 'kumo_chat').replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setOpenMenuChatId(null);
  };

  return (
    <>
      {/* Desktop Leftmost Rail Bar */}
      <aside className="app-sidebar-rail">
        <button
          className="rail-btn"
          onClick={onToggle}
          title="Buka Sidebar"
        >
          <PanelLeft size={18} />
        </button>

        <button
          className={`rail-btn ${activeRoute === 'chat' ? 'new-chat-highlight' : ''}`}
          onClick={() => {
            onRouteChange('chat');
            onNewChat();
          }}
          title="New Chat"
        >
          <Plus size={18} />
        </button>

        <button
          className={`rail-btn ${activeRoute === 'journal' ? 'active' : ''}`}
          onClick={() => onRouteChange('journal')}
          title="Your Journal"
        >
          <BookOpen size={18} />
        </button>

        <button
          className={`rail-btn ${activeRoute === 'students' ? 'active' : ''}`}
          onClick={() => onRouteChange('students')}
          title="Students"
        >
          <GraduationCap size={18} />
        </button>

        <button
          className={`rail-btn ${activeRoute === 'images' ? 'active' : ''}`}
          onClick={() => onRouteChange('images')}
          title="Images"
        >
          <ImageIcon size={18} />
        </button>

        <button
          className={`rail-btn ${activeRoute === 'videos' ? 'active' : ''}`}
          onClick={() => onRouteChange('videos')}
          title="Videos"
        >
          <Video size={18} />
        </button>

        <button
          className={`rail-btn ${activeRoute === 'library' ? 'active' : ''}`}
          onClick={() => onRouteChange('library')}
          title="Library"
        >
          <Library size={18} />
        </button>

        <div className="rail-bottom">
          <button
            className="rail-avatar-btn"
            onClick={onOpenAuthModal}
            title={user.isLoggedIn ? `${user.name} (${user.email})` : 'Masuk / Daftar Akun'}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="rail-avatar-img" />
            ) : (
              <div className="rail-avatar-circle">{user.avatarInitials || 'NM'}</div>
            )}
          </button>

          <button
            className="rail-btn"
            onClick={onOpenSettings}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </aside>

      {/* Expandable Drawer Overlay */}
      <div
        className={`sidebar-drawer-overlay ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
      />

      {/* Expandable Drawer Menu */}
      <div className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <span style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Kumo
            </span>
          </div>
          <button className="history-act-btn" onClick={onToggle} title="Tutup sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Top Navigation Options */}
        <div className="sidebar-nav-group">
          <button
            type="button"
            className={`sidebar-nav-item ${activeRoute === 'chat' ? 'active' : ''}`}
            onClick={() => {
              onRouteChange('chat');
              onNewChat();
              if (window.innerWidth < 768) onToggle();
            }}
          >
            <Edit3 size={16} />
            <span>New chat</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${showSearchInput ? 'active' : ''}`}
            onClick={() => setShowSearchInput(!showSearchInput)}
          >
            <Search size={16} />
            <span>Search chats</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeRoute === 'students' ? 'active' : ''}`}
            onClick={() => {
              onRouteChange('students');
              if (window.innerWidth < 768) onToggle();
            }}
          >
            <GraduationCap size={16} />
            <span>Students</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeRoute === 'images' ? 'active' : ''}`}
            onClick={() => {
              onRouteChange('images');
              if (window.innerWidth < 768) onToggle();
            }}
          >
            <ImageIcon size={16} />
            <span>Images</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeRoute === 'videos' ? 'active' : ''}`}
            onClick={() => {
              onRouteChange('videos');
              if (window.innerWidth < 768) onToggle();
            }}
          >
            <Video size={16} />
            <span>Videos</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeRoute === 'library' ? 'active' : ''}`}
            onClick={() => {
              onRouteChange('library');
              if (window.innerWidth < 768) onToggle();
            }}
          >
            <Library size={16} />
            <span>Library</span>
          </button>
        </div>

        {/* Your Journal Section */}
        <div className="sidebar-section-container">
          <div className="sidebar-section-header">
            <span>Your Journal</span>
          </div>

          <button
            type="button"
            className={`sidebar-nav-item sub-action ${activeRoute === 'journal' ? 'active' : ''}`}
            onClick={() => {
              onRouteChange('journal');
              if (window.innerWidth < 768) onToggle();
            }}
          >
            <Plus size={15} />
            <span>Open & Edit Journal</span>
          </button>

          {notebooks.slice(0, 3).map((nb) => (
            <div
              key={nb.id}
              className="sidebar-notebook-item"
              onClick={() => {
                onRouteChange('journal');
                if (window.innerWidth < 768) onToggle();
              }}
            >
              <BookOpen size={14} color="var(--text-muted)" />
              <span className="sidebar-notebook-title">{nb.title}</span>
            </div>
          ))}
        </div>

        {/* Recents Section */}
        <div className="sidebar-section-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="sidebar-section-header">
            <span>Recents</span>
          </div>

          {/* Search bar when toggled */}
          {showSearchInput && (
            <div className="drawer-search-box">
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Cari percakapan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)' }}>
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Chat List with Context Menu */}
          <div className="chat-history-list">
            {filteredChats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada percakapan'}
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`history-item ${chat.id === activeChatId && activeRoute === 'chat' ? 'active' : ''}`}
                  onClick={() => {
                    onRouteChange('chat');
                    onSelectChat(chat.id);
                    if (window.innerWidth < 768) onToggle();
                  }}
                >
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      className="history-rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleSaveRename(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(chat.id);
                        if (e.key === 'Escape') setEditingChatId(null);
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}>
                      {chat.pinned && <Pin size={12} color="#2563eb" style={{ flexShrink: 0, transform: 'rotate(45deg)' }} />}
                      <span className="history-title">{chat.title || 'Percakapan Baru'}</span>
                    </div>
                  )}

                  {/* Context Menu Trigger */}
                  <div className="history-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="history-act-btn"
                      onClick={() => setOpenMenuChatId(openMenuChatId === chat.id ? null : chat.id)}
                      title="Opsi percakapan"
                      aria-haspopup="menu"
                      aria-expanded={openMenuChatId === chat.id}
                      aria-label="Opsi percakapan"
                    >
                      <MoreHorizontal size={15} />
                    </button>

                    {/* Chat Context Menu */}
                    <AnimatePresence>
                      {openMenuChatId === chat.id && (
                        <motion.div
                          className="chat-context-menu"
                          ref={menuRef}
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          role="menu"
                        >
                          <button
                            type="button"
                            className="context-menu-item"
                            onClick={() => {
                              setOpenMenuChatId(null);
                              onOpenShareModal?.(chat);
                            }}
                            role="menuitem"
                          >
                            <Share2 size={15} />
                            <span>Share conversation</span>
                          </button>

                          <button
                            type="button"
                            className="context-menu-item"
                            onClick={() => {
                              onTogglePinChat?.(chat.id);
                              setOpenMenuChatId(null);
                            }}
                            role="menuitem"
                          >
                            <Pin size={15} />
                            <span>{chat.pinned ? 'Unpin' : 'Pin'}</span>
                          </button>

                          <button
                            type="button"
                            className="context-menu-item"
                            onClick={() => startRename(chat)}
                            role="menuitem"
                          >
                            <Edit3 size={15} />
                            <span>Rename</span>
                          </button>

                          <button
                            type="button"
                            className="context-menu-item"
                            onClick={() => handleDownloadText(chat)}
                            role="menuitem"
                          >
                            <Download size={15} />
                            <span>Download TXT</span>
                          </button>

                          <button
                            type="button"
                            className="context-menu-item"
                            onClick={() => handleExportDocs(chat)}
                            role="menuitem"
                          >
                            <FileText size={15} />
                            <span>Export to Docs</span>
                          </button>

                          <button
                            type="button"
                            className="context-menu-item"
                            onClick={() => {
                              onRouteChange('journal');
                              setOpenMenuChatId(null);
                            }}
                            role="menuitem"
                          >
                            <BookOpen size={15} />
                            <span>Go to journal</span>
                          </button>

                          <div className="context-menu-divider" />

                          <button
                            type="button"
                            className="context-menu-item danger"
                            onClick={() => {
                              onDeleteChat(chat.id);
                              setOpenMenuChatId(null);
                            }}
                            role="menuitem"
                          >
                            <Trash2 size={15} />
                            <span>Delete</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer User Profile Bar (Kumo Custom Aesthetic) */}
        <div className="sidebar-footer-profile-wrapper">
          <div
            className="sidebar-user-card"
            onClick={onOpenAuthModal}
            title={user.isLoggedIn ? `Akun: ${user.name} (${user.email})` : 'Klik untuk masuk atau daftar'}
          >
            <div className="user-avatar-badge">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="user-avatar-img" />
              ) : (
                <div className="user-avatar-initials">{user.avatarInitials || 'PK'}</div>
              )}
            </div>

            <div className="user-profile-text-col">
              <span className="user-profile-name">{user.isLoggedIn ? user.name : 'Masuk Akun'}</span>
              <span className="user-profile-plan">{user.isLoggedIn ? user.plan : 'Mode Tamu'}</span>
            </div>

            <div className="user-profile-actions">
              <button
                type="button"
                className="user-settings-gear-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSettings();
                }}
                title="Pengaturan Kumo"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
