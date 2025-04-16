class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.applySettings();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('chatbot_settings');
        return savedSettings ? JSON.parse(savedSettings) : CONFIG.DEFAULT_SETTINGS;
    }

    saveSettings() {
        localStorage.setItem('chatbot_settings', JSON.stringify(this.settings));
    }

    update(newSettings) {
        this.settings = {
            ...this.settings,
            ...newSettings
        };
        this.saveSettings();
        this.applySettings();
    }

    applySettings() {
        // Apply theme
        document.body.className = this.settings.theme;

        // Update form elements
        document.getElementById('theme').value = this.settings.theme;
        document.getElementById('language').value = this.settings.language;
        document.getElementById('voice-output').checked = this.settings.voiceOutput;
        document.getElementById('font-size').value = this.settings.fontSize;

        // Apply font size
        document.documentElement.style.setProperty('--base-font-size', this.settings.fontSize + 'px');

        // Update speech synthesis settings if voice output is enabled
        if (this.settings.voiceOutput) {
            this.setupSpeechSynthesis();
        }
    }

    setupSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            // Get available voices and set preferred voice
            speechSynthesis.onvoiceschanged = () => {
                const voices = speechSynthesis.getVoices();
                const preferredVoice = voices.find(voice => 
                    voice.lang.startsWith(this.settings.language)
                );
                if (preferredVoice) {
                    this.settings.voice = preferredVoice;
                }
            };
        }
    }

    get(key) {
        return this.settings[key];
    }

    getAll() {
        return { ...this.settings };
    }

    reset() {
        this.settings = { ...CONFIG.DEFAULT_SETTINGS };
        this.saveSettings();
        this.applySettings();
    }

    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', 'chatbot_settings.json');
        exportLink.click();
    }

    async importSettings(file) {
        try {
            const text = await file.text();
            const newSettings = JSON.parse(text);
            
            // Validate settings
            const requiredKeys = Object.keys(CONFIG.DEFAULT_SETTINGS);
            const hasAllKeys = requiredKeys.every(key => key in newSettings);
            
            if (!hasAllKeys) {
                throw new Error('Invalid settings file: missing required settings');
            }

            this.update(newSettings);
            return true;
        } catch (error) {
            console.error('Error importing settings:', error);
            return false;
        }
    }
}

// Create global Settings instance
const Settings = new SettingsManager(); 