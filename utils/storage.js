// Local storage manager for chats, notebooks, settings, and API keys
const STORAGE_KEYS = {
  CHATS: 'gemini_chats_v1',
  ACTIVE_CHAT_ID: 'gemini_active_chat_id',
  NOTEBOOKS: 'gemini_notebooks_v1',
  API_KEY: 'gemini_api_key',
  SETTINGS: 'gemini_settings_v1',
  THEME: 'gemini_theme',
  USER_PROFILE: 'kumo_user_profile_v1'
};

const DEFAULT_USER = {
  isLoggedIn: true,
  name: 'Penjelajah Kumo',
  email: 'penjelajah@kumo.ai',
  plan: 'Kumo Pro',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  avatarInitials: 'PK'
};

const DEFAULT_SETTINGS = {
  model: 'gemini-3.6-flash',
  systemPrompt: `You are an expert AI assistant. Answer directly, naturally, thoughtfully, and helpfully with clean Markdown formatting.

Tone and style instructions:
- Speak in a natural, conversational, and direct voice (similar to ChatGPT or Claude).
- Do NOT refer to yourself in the third person or use repetitive self-referential phrases (e.g., avoid "Menurut Kumo", "Pandangan Kumo", "Tanyakan pada Kumo", etc.).
- Maintain fluent, articulate, and natural Indonesian (or the user's chosen language).
- Provide structured, informative, and engaging explanations without robotic disclaimers or forced preamble.`,
  temperature: 0.7,
  searchEnabled: false,
  reasoningEnabled: false,
  streamResponse: true,
  colorTheme: 'monochrome',
  fontSize: 'medium',
  saveHistory: true,
  soundEnabled: true,
  enterToSend: true
};

const DEFAULT_NOTEBOOKS = [
  { id: 'nb_1', title: 'Ide Proyek & Coding', updatedAt: Date.now(), notes: 'Kumpulan ide fitur dan arsitektur aplikasi AI.' },
  { id: 'nb_2', title: 'Catatan Belajar AI', updatedAt: Date.now(), notes: 'Rangkuman pemahaman prompt engineering dan reasoning.' }
];

export const createNewChat = (title = 'Percakapan Baru') => {
  return {
    id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: title,
    pinned: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: []
  };
};

export const getSavedChats = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load chats from localStorage', e);
    return [];
  }
};

export const saveChats = (chats) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  } catch (e) {
    console.error('Failed to save chats', e);
  }
};

export const getSavedNotebooks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTEBOOKS);
    if (!raw) return DEFAULT_NOTEBOOKS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_NOTEBOOKS;
  }
};

export const saveNotebooks = (notebooks) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTEBOOKS, JSON.stringify(notebooks));
  } catch (e) {
    console.error('Failed to save notebooks', e);
  }
};

export const getActiveChatId = () => {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT_ID) || null;
};

export const setActiveChatId = (id) => {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
  }
};

export const getApiKey = () => {
  const key = localStorage.getItem(STORAGE_KEYS.API_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
  return key.trim();
};

export const saveApiKey = (key) => {
  if (key) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  }
};

export const getSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    if (
      !parsed.systemPrompt ||
      parsed.systemPrompt.includes('You are Kumo, a helpful') ||
      parsed.systemPrompt.length < 50
    ) {
      parsed.systemPrompt = DEFAULT_SETTINGS.systemPrompt;
    }
    if (
      !parsed.model ||
      parsed.model.includes('2.5') ||
      parsed.model.includes('1.5')
    ) {
      parsed.model = 'gemini-3.6-flash';
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

export const getTheme = () => {
  return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
};

export const saveTheme = (theme) => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export const getUserProfile = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return DEFAULT_USER;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER;
  }
};

export const saveUserProfile = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
};

export const getCustomPrompts = () => {
  try {
    const raw = localStorage.getItem('kumo_custom_prompts_v1');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveCustomPrompts = (prompts) => {
  try {
    localStorage.setItem('kumo_custom_prompts_v1', JSON.stringify(prompts));
  } catch (e) {
    console.error('Failed to save custom prompts', e);
  }
};
