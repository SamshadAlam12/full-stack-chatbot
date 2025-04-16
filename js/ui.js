class UIManager {
    constructor() {
        this.messagesContainer = document.getElementById('messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-message');
        this.voiceButton = document.getElementById('voice-input');
        this.attachButton = document.getElementById('attach-file');
        this.fileInput = document.getElementById('file-input');
        this.settingsButton = document.getElementById('settings');
        this.settingsModal = document.getElementById('settings-modal');
        this.clearHistoryButton = document.getElementById('clear-history');
        
        this.setupEventListeners();
        this.setupAutoResize();
    }

    setupEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => {
            const message = this.userInput.value.trim();
            if (message) {
                Chat.sendMessage(message);
            }
        });

        // Send message on Enter (but allow Shift+Enter for new lines)
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = this.userInput.value.trim();
                if (message) {
                    Chat.sendMessage(message);
                }
            }
        });

        // Voice input handling
        this.voiceButton.addEventListener('mousedown', () => {
            Chat.startVoiceInput();
        });

        this.voiceButton.addEventListener('mouseup', () => {
            Chat.stopVoiceInput();
        });

        // File attachment handling
        this.attachButton.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', () => {
            const file = this.fileInput.files[0];
            if (file) {
                Chat.sendMessage('', 'file', file);
                this.fileInput.value = ''; // Reset file input
            }
        });

        // Settings modal
        this.settingsButton.addEventListener('click', () => {
            this.showSettingsModal();
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            this.hideSettingsModal();
        });

        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Clear history
        this.clearHistoryButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the chat history?')) {
                Chat.clearHistory();
            }
        });
    }

    setupAutoResize() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = this.userInput.scrollHeight + 'px';
        });
    }

    addMessage(text, type, metadata = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = type === 'ai' ? 'assets/ai-avatar.png' : 'assets/user-avatar.png';
        avatar.alt = type === 'ai' ? 'AI' : 'User';

        const content = document.createElement('div');
        content.className = 'message-content';

        // Format message text (handle markdown, code blocks, etc.)
        const formattedText = this.formatMessage(text);
        content.innerHTML = formattedText;

        // Add metadata if present
        if (metadata.sentiment) {
            const sentimentSpan = document.createElement('span');
            sentimentSpan.className = `sentiment ${metadata.sentiment.label}`;
            sentimentSpan.textContent = `Sentiment: ${metadata.sentiment.label}`;
            content.appendChild(sentimentSpan);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        this.messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        this.scrollToBottom();
    }

    formatMessage(text) {
        // Convert markdown-style formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing';
        typingDiv.innerHTML = `
            <img src="assets/ai-avatar.png" alt="AI" class="avatar">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = this.messagesContainer.querySelector('.typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.messagesContainer.appendChild(errorDiv);
        this.scrollToBottom();

        // Remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showSettingsModal() {
        this.settingsModal.style.display = 'flex';
    }

    hideSettingsModal() {
        this.settingsModal.style.display = 'none';
    }

    saveSettings() {
        const settings = {
            theme: document.getElementById('theme').value,
            language: document.getElementById('language').value,
            voiceOutput: document.getElementById('voice-output').checked
        };

        Settings.update(settings);
        this.hideSettingsModal();
        this.applyTheme(settings.theme);
    }

    applyTheme(theme) {
        document.body.className = theme;
    }

    clearMessages() {
        this.messagesContainer.innerHTML = '';
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    showVoiceInputActive() {
        this.voiceButton.classList.add('active');
    }

    hideVoiceInputActive() {
        this.voiceButton.classList.remove('active');
    }
}

// Create global UI instance
const UI = new UIManager(); 