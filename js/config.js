const CONFIG = {
    API_URL: 'http://localhost:5000',
    SOCKET_URL: 'http://localhost:5000',
    DEFAULT_SETTINGS: {
        theme: 'light',
        language: 'en',
        voiceOutput: false,
        fontSize: 16,
        notificationsEnabled: true,
        messageHistory: 50,
        autoScroll: true,
        markdownEnabled: true,
        soundEffects: true,
        typingIndicator: true,
        timestampFormat: '24h',
        maxAttachmentSize: 5 * 1024 * 1024, // 5MB
    },
    MAX_MESSAGE_LENGTH: 1000,
    MESSAGE_TIMEOUT: 30000, // 30 seconds
    TYPING_INDICATOR_TIMEOUT: 1000,
    MESSAGE_HISTORY_LIMIT: 100,
    SUPPORTED_FILE_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain'
    ],
    MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};

const THEMES = {
    light: {
        primary: '#007bff',
        background: '#ffffff',
        text: '#212529',
        secondaryText: '#6c757d',
        border: '#dee2e6',
        hover: '#f8f9fa'
    },
    dark: {
        primary: '#0d6efd',
        background: '#212529',
        text: '#f8f9fa',
        secondaryText: '#adb5bd',
        border: '#495057',
        hover: '#343a40'
    }
};

const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' }
];

const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const API = {
    BASE_URL: 'https://api.chatbot.example.com',
    ENDPOINTS: {
        MESSAGES: '/messages',
        ATTACHMENTS: '/attachments',
        SETTINGS: '/settings',
        VOICE: '/voice'
    },
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
};

const ANIMATIONS = {
    DURATION: 300,
    EASING: 'ease-in-out'
};

const ERROR_MESSAGES = {
    NETWORK: 'Network error. Please check your connection.',
    FILE_SIZE: 'File size exceeds the maximum limit.',
    FILE_TYPE: 'File type not supported.',
    SETTINGS_IMPORT: 'Invalid settings file format.',
    VOICE_UNAVAILABLE: 'Voice input is not available on this device.',
    GENERAL: 'An error occurred. Please try again.'
};

const UI_SETTINGS = {
    DEFAULT_THEME: 'light',
    DEFAULT_FONT_SIZE: 'medium',
    DEFAULT_LANGUAGE: 'en-US'
};

const STORAGE_KEYS = {
    THEME: 'chat_theme',
    FONT_SIZE: 'chat_font_size',
    LANGUAGE: 'chat_language',
    MESSAGE_HISTORY: 'chat_message_history',
    USER_SETTINGS: 'chat_user_settings'
}; 