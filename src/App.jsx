import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MotionConfig } from 'motion/react';
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

  // Streaming & Request Lifecycle state
  const [isLoading, setIsLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState('idle'); // 'idle' | 'started' | 'waiting' | 'streaming' | 'completed' | 'cancelled' | 'error'
  const [requestStartTime, setRequestStartTime] = useState(null);
  const [requestEndTime, setRequestEndTime] = useState(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingThinking, setStreamingThinking] = useState('');
  const [streamingSources, setStreamingSources] = useState([]);

  const abortControllerRef = useRef(null);
  const activeRequestIdRef = useRef(null);
  const streamingContentRef = useRef('');
  const streamingThinkingRef = useRef('');
  const streamingSourcesRef = useRef([]);

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
    // If request in flight, abort cleanly to prevent cross-chat state pollution
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setActiveChatIdState(id);
    setActiveChatId(id);
    setIsLoading(false);
    setRequestStatus('idle');
    setStreamingContent('');
    setStreamingThinking('');
    setStreamingSources([]);
    setActiveRoute('chat');
  };

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    const newChat = createNewChat('Percakapan Baru');
    setChats(prev => [newChat, ...prev]);
    setActiveChatIdState(newChat.id);
    setActiveChatId(newChat.id);
    setInput('');
    setAttachment(null);
    setIsLoading(false);
    setRequestStatus('idle');
    setStreamingContent('');
    setStreamingThinking('');
    setStreamingSources([]);
    setActiveRoute('chat');
  };

  const handleDeleteChat = (id) => {
    if (activeChatId === id && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
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

  // Safe Stop Handler for AI generation
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsLoading(false);
    setRequestStatus('cancelled');
    const endTime = Date.now();
    setRequestEndTime(endTime);

    // Preserve any partial response streamed so far for the active chat
    const targetChatId = activeRequestIdRef.current;
    const partialText = streamingContentRef.current;
    const partialThinking = streamingThinkingRef.current;
    const partialSources = streamingSourcesRef.current;

    if (targetChatId && (partialText || partialThinking)) {
      const partialMessage = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        role: 'assistant',
        content: partialText ? `${partialText}\n\n*(Respons dihentikan)*` : '*(Respons dihentikan)*',
        thinking: partialThinking,
        sources: partialSources || [],
        status: 'cancelled',
        startTime: requestStartTime,
        endTime: endTime,
        timestamp: endTime
      };

      setChats(prev => prev.map(c => {
        if (c.id === targetChatId) {
          return {
            ...c,
            messages: [...(c.messages || []), partialMessage],
            updatedAt: endTime
          };
        }
        return c;
      }));
    }

    setStreamingContent('');
    setStreamingThinking('');
    setStreamingSources([]);
  }, [requestStartTime]);

  // Dispatch message to active chat
  const handleSendMessage = useCallback(async (customText, customAttachment) => {
    const textToSend = typeof customText === 'string' ? customText : input;
    const attachmentToSend = customAttachment !== undefined ? customAttachment : attachment;

    if ((!textToSend || !textToSend.trim()) && !attachmentToSend) return;
    if (isLoading) return;

    // Abort any previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentChat = chats.find(c => c.id === activeChatId) || activeChat;
    activeRequestIdRef.current = currentChat.id;
    const isFirstMessage = (currentChat.messages || []).length === 0;

    const userMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
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

    const startTime = Date.now();
    setRequestStartTime(startTime);
    setRequestEndTime(null);
    setRequestStatus('started');

    streamingContentRef.current = '';
    streamingThinkingRef.current = '';
    streamingSourcesRef.current = [];
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
        signal: controller.signal,
        onChunk: (chunk) => {
          streamingContentRef.current += chunk;
          setStreamingContent(prev => prev + chunk);
          setRequestStatus('streaming');
        },
        onThinking: (thinkingChunk) => {
          streamingThinkingRef.current += thinkingChunk;
          setStreamingThinking(prev => prev + thinkingChunk);
        },
        onSources: (sources) => {
          streamingSourcesRef.current = sources;
          setStreamingSources(sources);
        }
      });

      const endTime = Date.now();
      setRequestEndTime(endTime);
      setRequestStatus('completed');

      const assistantMessage = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        role: 'assistant',
        content: response.content,
        thinking: response.thinking,
        sources: response.sources || [],
        status: 'completed',
        startTime: startTime,
        endTime: endTime,
        timestamp: endTime
      };

      setChats(prev => prev.map(c => {
        if (c.id === currentChat.id) {
          return {
            ...c,
            messages: [...updatedMessages, assistantMessage],
            updatedAt: endTime
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
      const endTime = Date.now();
      setRequestEndTime(endTime);

      if (err.name === 'AbortError' || controller.signal.aborted) {
        setRequestStatus('cancelled');
        if (streamingContentRef.current || streamingThinkingRef.current) {
          const cancelledMessage = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            role: 'assistant',
            content: `${streamingContentRef.current}\n\n*(Respons dihentikan)*`,
            thinking: streamingThinkingRef.current,
            sources: streamingSourcesRef.current || [],
            status: 'cancelled',
            startTime: startTime,
            endTime: endTime,
            timestamp: endTime
          };

          setChats(prev => prev.map(c => {
            if (c.id === currentChat.id) {
              return {
                ...c,
                messages: [...updatedMessages, cancelledMessage],
                updatedAt: endTime
              };
            }
            return c;
          }));
        }
      } else {
        console.error('Gemini Send Error:', err);
        setRequestStatus('error');
        const errorMessage = {
          id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          role: 'assistant',
          content: `⚠️ Terjadi kendala saat memproses jawaban:\n\n\`\`\`\n${err.message || 'Error tidak diketahui'}\n\`\`\`\n\nPastikan koneksi internet aktif atau periksa Google Gemini API Key Anda di menu profil/pengaturan.`,
          isError: true,
          status: 'error',
          startTime: startTime,
          endTime: endTime,
          timestamp: endTime
        };

        setChats(prev => prev.map(c => {
          if (c.id === currentChat.id) {
            return {
              ...c,
              messages: [...updatedMessages, errorMessage],
              updatedAt: endTime
            };
          }
          return c;
        }));
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
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
    <MotionConfig reducedMotion="user">
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
                requestStatus={requestStatus}
                requestStartTime={requestStartTime}
                requestEndTime={requestEndTime}
                streamingContent={streamingContent}
                streamingThinking={streamingThinking}
                streamingSources={streamingSources}
                onSelectSuggestion={(prompt) => handleSendMessage(prompt)}
                onRegenerate={handleRegenerate}
                input={input}
                setInput={setInput}
                onSend={() => handleSendMessage()}
                onStop={handleStopGeneration}
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
    </MotionConfig>
  );
}
