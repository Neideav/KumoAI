import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SettingsModal from '../components/SettingsModal';
import ShareModal from '../components/ShareModal';
import AuthModal from '../components/AuthModal';

// Dedicated Isolated Views for Clean Architecture & Easy Debugging
import ChatView from '../views/ChatView';
import StudentsView from '../views/StudentsView';
import ImagesView from '../views/ImagesView';
import VideosView from '../views/VideosView';
import LibraryView from '../views/LibraryView';
import JournalView from '../views/JournalView';

import {
  createNewChat,
  getSavedChats,
  saveChats,
  getSavedNotebooks,
  saveNotebooks,
  getActiveChatId,
  setActiveChatId,
  getApiKey,
  saveApiKey,
  getSettings,
  saveSettings,
  getTheme,
  saveTheme,
  getUserProfile,
  saveUserProfile
} from '../utils/storage';

import { sendMessageToGemini } from '../services/geminiService';

export default function App() {
  // Navigation Route state
  const [activeRoute, setActiveRoute] = useState('chat');

  // Chats & Notebooks state
  const [chats, setChats] = useState(() => getSavedChats());
  const [notebooks, setNotebooks] = useState(() => getSavedNotebooks());
  const [activeChatId, setActiveChatIdState] = useState(() => {
    const saved = getActiveChatId();
    if (saved && getSavedChats().some(c => c.id === saved)) {
      return saved;
    }
    const initialChats = getSavedChats();
    if (initialChats.length > 0) return initialChats[0].id;
    const firstChat = createNewChat('Percakapan Baru');
    return firstChat.id;
  });

  // Chat input and state
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const [isReasoning, setIsReasoning] = useState(false);

  // Streaming state
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingThinking, setStreamingThinking] = useState('');
  const [streamingSources, setStreamingSources] = useState([]);

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => getApiKey());
  const [settings, setSettings] = useState(() => getSettings());
  const [theme, setTheme] = useState(() => getTheme());
  const [user, setUser] = useState(() => getUserProfile());

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [sharedChat, setSharedChat] = useState(null);

  // Sync user profile to storage
  useEffect(() => {
    saveUserProfile(user);
  }, [user]);

  // Sync theme, color scheme, and font size to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-color-theme', settings.colorTheme || 'monochrome');
    document.documentElement.setAttribute('data-font-size', settings.fontSize || 'medium');
    saveTheme(theme);
  }, [theme, settings.colorTheme, settings.fontSize]);

  // Persist chats (if saveHistory is enabled)
  useEffect(() => {
    if (settings.saveHistory !== false) {
      saveChats(chats);
    }
  }, [chats, settings.saveHistory]);

  // Persist notebooks
  useEffect(() => {
    saveNotebooks(notebooks);
  }, [notebooks]);

  // Persist settings
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Ensure active chat exists
  useEffect(() => {
    if (chats.length === 0) {
      const newChat = createNewChat('Percakapan Baru');
      setChats([newChat]);
      setActiveChatIdState(newChat.id);
      setActiveChatId(newChat.id);
    }
  }, [chats]);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0] || createNewChat('Percakapan Baru');

  const handleSelectChat = (id) => {
    setActiveChatIdState(id);
    setActiveChatId(id);
    setIsLoading(false);
    setStreamingContent('');
    setStreamingThinking('');
    setStreamingSources([]);
    setActiveRoute('chat');
  };

  const handleNewChat = () => {
    const newChat = createNewChat('Percakapan Baru');
    setChats(prev => [newChat, ...prev]);
    setActiveChatIdState(newChat.id);
    setActiveChatId(newChat.id);
    setInput('');
    setAttachment(null);
    setIsLoading(false);
    setStreamingContent('');
    setStreamingThinking('');
    setStreamingSources([]);
    setActiveRoute('chat');
  };

  const handleDeleteChat = (id) => {
    const remaining = chats.filter(c => c.id !== id);
    if (remaining.length === 0) {
      const fresh = createNewChat('Percakapan Baru');
      setChats([fresh]);
      setActiveChatIdState(fresh.id);
      setActiveChatId(fresh.id);
    } else {
      setChats(remaining);
      if (activeChatId === id) {
        setActiveChatIdState(remaining[0].id);
        setActiveChatId(remaining[0].id);
      }
    }
  };

  const handleRenameChat = (id, newTitle) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c));
  };

  const handleTogglePinChat = (id) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Dispatch message to active chat
  const handleSendMessage = useCallback(async (customText, customAttachment) => {
    const textToSend = typeof customText === 'string' ? customText : input;
    const attachmentToSend = customAttachment !== undefined ? customAttachment : attachment;

    if ((!textToSend || !textToSend.trim()) && !attachmentToSend) return;
    if (isLoading) return;

    const currentChat = chats.find(c => c.id === activeChatId) || activeChat;
    const isFirstMessage = (currentChat.messages || []).length === 0;

    const userMessage = {
      role: 'user',
      content: textToSend.trim(),
      attachment: attachmentToSend,
      timestamp: Date.now()
    };

    // Auto update chat title from first prompt
    let chatTitle = currentChat.title;
    if (isFirstMessage) {
      chatTitle = textToSend.slice(0, 36).trim() || 'Percakapan Kumo';
    }

    const updatedMessages = [...(currentChat.messages || []), userMessage];

    setChats(prev => prev.map(c => {
      if (c.id === currentChat.id) {
        return {
          ...c,
          title: chatTitle,
          messages: updatedMessages,
          updatedAt: Date.now()
        };
      }
      return c;
    }));

    setInput('');
    setAttachment(null);
    setIsLoading(true);
    setStreamingContent('');
    setStreamingThinking('');
    setStreamingSources([]);

    try {
      const chatHistory = updatedMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.content || '' }]
      }));

      const activeModel = settings.model || 'gemini-3.6-flash';
      const promptInstruction = isReasoning
        ? `${settings.systemPrompt}\n[Catatan: Lakukan penalaran mendalam (step-by-step reasoning) sebelum memberikan jawaban final.]`
        : settings.systemPrompt;

      const response = await sendMessageToGemini({
        apiKey,
        model: activeModel,
        history: chatHistory,
        message: textToSend,
        attachment: attachmentToSend,
        systemPrompt: promptInstruction,
        temperature: settings.temperature,
        enableSearch: isDeepSearch || settings.searchEnabled,
        onChunk: (chunk) => {
          setStreamingContent(prev => prev + chunk);
        },
        onThinking: (thinkingChunk) => {
          setStreamingThinking(prev => prev + thinkingChunk);
        },
        onSources: (sources) => {
          setStreamingSources(sources);
        }
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.content,
        thinking: response.thinking,
        sources: response.sources || [],
        timestamp: Date.now()
      };

      setChats(prev => prev.map(c => {
        if (c.id === currentChat.id) {
          return {
            ...c,
            messages: [...updatedMessages, assistantMessage],
            updatedAt: Date.now()
          };
        }
        return c;
      }));

      // Play soft notification chime if enabled
      if (settings.soundEnabled !== false) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } catch {}
      }
    } catch (err) {
      console.error('Gemini Send Error:', err);
      const errorMessage = {
        role: 'assistant',
        content: `⚠️ Terjadi kendala saat memproses jawaban:\n\n\`\`\`\n${err.message || 'Error tidak diketahui'}\n\`\`\`\n\nPastikan koneksi internet aktif atau periksa Google Gemini API Key Anda di menu profil/pengaturan.`,
        isError: true,
        timestamp: Date.now()
      };

      setChats(prev => prev.map(c => {
        if (c.id === currentChat.id) {
          return {
            ...c,
            messages: [...updatedMessages, errorMessage],
            updatedAt: Date.now()
          };
        }
        return c;
      }));
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      setStreamingThinking('');
      setStreamingSources([]);
    }
  }, [input, attachment, isLoading, chats, activeChatId, activeChat, settings, apiKey, isReasoning, isDeepSearch]);

  const handleClearAllChats = () => {
    const fresh = createNewChat('Percakapan Baru');
    setChats([fresh]);
    setActiveChatIdState(fresh.id);
    setActiveChatId(fresh.id);
    setInput('');
    setAttachment(null);
  };

  const handleLaunchChatWithPrompt = (promptText) => {
    setActiveRoute('chat');
    handleNewChat();
    setTimeout(() => {
      handleSendMessage(promptText);
    }, 80);
  };

  const handleRegenerate = () => {
    const currentChat = chats.find(c => c.id === activeChatId) || activeChat;
    const msgs = currentChat.messages || [];
    if (msgs.length === 0) return;

    let lastUserMsgIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserMsgIndex = i;
        break;
      }
    }

    if (lastUserMsgIndex === -1) return;

    const lastUserMessage = msgs[lastUserMsgIndex];
    const trimmedMessages = msgs.slice(0, lastUserMsgIndex);

    setChats(prev => prev.map(c => {
      if (c.id === currentChat.id) {
        return {
          ...c,
          messages: trimmedMessages,
          updatedAt: Date.now()
        };
      }
      return c;
    }));

    handleSendMessage(lastUserMessage.content, lastUserMessage.attachment);
  };

  const handleModelChange = (modelId) => {
    setSettings(prev => ({ ...prev, model: modelId }));
  };

  const getRouteTitle = () => {
    switch (activeRoute) {
      case 'students':
        return 'Students';
      case 'images':
        return 'Images';
      case 'videos':
        return 'Videos';
      case 'library':
        return 'Library';
      case 'journal':
        return 'Your Journal';
      default:
        return 'Kumo';
    }
  };

  return (
    <div className="app-layout-root">
      {/* Sidebar Rail & Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        notebooks={notebooks}
        activeRoute={activeRoute}
        onRouteChange={(route) => setActiveRoute(route)}
        onOpenShareModal={(chat) => {
          setSharedChat(chat || activeChat);
          setIsShareModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="app-main-viewport">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenShareModal={() => {
            setSharedChat(activeChat);
            setIsShareModalOpen(true);
          }}
          currentRouteTitle={getRouteTitle()}
        />

        {/* Dynamic Route View Rendering */}
        <div className="view-content-router">
          {activeRoute === 'chat' && (
            <ChatView
              messages={activeChat.messages || []}
              isLoading={isLoading}
              streamingContent={streamingContent}
              streamingThinking={streamingThinking}
              streamingSources={streamingSources}
              onSelectSuggestion={(prompt) => handleSendMessage(prompt)}
              onRegenerate={handleRegenerate}
              input={input}
              setInput={setInput}
              onSend={() => handleSendMessage()}
              onStop={() => setIsLoading(false)}
              attachment={attachment}
              setAttachment={setAttachment}
              isDeepSearch={isDeepSearch}
              setIsDeepSearch={setIsDeepSearch}
              isReasoning={isReasoning}
              setIsReasoning={setIsReasoning}
              currentModel={settings.model || 'gemini-3.6-flash'}
              onModelChange={handleModelChange}
              enterToSend={settings.enterToSend}
            />
          )}

          {activeRoute === 'students' && (
            <StudentsView
              onLaunchChatWithPrompt={handleLaunchChatWithPrompt}
            />
          )}

          {activeRoute === 'images' && (
            <ImagesView
              onLaunchChatWithPrompt={handleLaunchChatWithPrompt}
            />
          )}

          {activeRoute === 'videos' && (
            <VideosView
              onLaunchChatWithPrompt={handleLaunchChatWithPrompt}
            />
          )}

          {activeRoute === 'library' && (
            <LibraryView
              onLaunchChatWithPrompt={handleLaunchChatWithPrompt}
            />
          )}

          {activeRoute === 'journal' && (
            <JournalView
              notebooks={notebooks}
              onSaveNotebooks={setNotebooks}
              onLaunchChatWithPrompt={handleLaunchChatWithPrompt}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(s) => setSettings(s)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        chats={chats}
        onClearAllChats={handleClearAllChats}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        chat={sharedChat || activeChat}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onUpdateUser={(u) => setUser(u)}
      />
    </div>
  );
}
