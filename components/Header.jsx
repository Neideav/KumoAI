import React from 'react';
import { PanelLeft, Moon, Sun, Share2, Sparkles } from 'lucide-react';

export default function Header({
  onToggleSidebar,
  theme,
  onToggleTheme,
  onOpenShareModal,
  currentRouteTitle = 'Kumo'
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="header-icon-btn mobile-toggle"
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
          aria-label="Toggle Sidebar"
        >
          <PanelLeft size={19} />
        </button>
        <div className="brand-logo-wrap">
          <span className="brand-title">Kumo</span>
          {currentRouteTitle && currentRouteTitle !== 'Kumo' && (
            <span className="route-crumb-badge">/ {currentRouteTitle}</span>
          )}
        </div>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="btn-share-header"
          onClick={onOpenShareModal}
          title="Bagikan Percakapan"
        >
          <Share2 size={15} />
          <span>Share</span>
        </button>

        <button
          className="icon-action-btn"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Beralih ke Dark Mode' : 'Beralih ke Light Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
}
