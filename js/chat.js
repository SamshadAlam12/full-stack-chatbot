class ChatManager {
    constructor() {
        this.socket = io(CONFIG.SOCKET_URL);
        this.messageHistory = [];
        this.setupSocketListeners();
        this.setupSpeechRecognition();
    }

    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('response', (response) => {
            this.handleBotResponse(response);
        });

        this.socket.on('error', (error) => {
            console.error('Server error:', error);
            UI.showError('An error occurred. Please try again.');
        });
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('user-input').value = transcript;
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                UI.showError('Speech recognition failed. Please try again.');
            };
        }
    }

    async sendMessage(message, type = 'text', file = null) {
        if (!message.trim() && !file) return;

        // Add message to UI immediately
        UI.addMessage(message, 'user');

        // Prepare message data
        const messageData = {
            text: message,
            type: type,
            timestamp: new Date().toISOString()
        };

        if (file) {
            messageData.file = await this.processFile(file);
        }

        // Show typing indicator
        UI.showTypingIndicator();

        // Send message to server
        this.socket.emit('message', messageData);

        // Add to history
        this.messageHistory.push({
            type: 'user',
            content: messageData
        });

        // Clear input
        document.getElementById('user-input').value = '';
    }

    async processFile(file) {
        return new Promise((resolve, reject) => {
            if (!CONFIG.SUPPORTED_FILE_TYPES.includes(file.type)) {
                UI.showError('File type not supported');
                reject('Unsupported file type');
                return;
            }

            if (file.size > CONFIG.MAX_FILE_SIZE) {
                UI.showError('File too large');
                reject('File too large');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    type: file.type,
                    data: e.target.result.split(',')[1]
                });
            };
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    handleBotResponse(response) {
        // Remove typing indicator
        UI.hideTypingIndicator();

        // Add response to UI
        UI.addMessage(response.text, 'ai', response.metadata);

        // Add to history
        this.messageHistory.push({
            type: 'ai',
            content: response
        });

        // Speak response if enabled
        if (Settings.get('voiceOutput')) {
            this.speakResponse(response.text);
        }

        // Trim history if needed
        if (this.messageHistory.length > CONFIG.MESSAGE_HISTORY_LIMIT) {
            this.messageHistory = this.messageHistory.slice(-CONFIG.MESSAGE_HISTORY_LIMIT);
        }
    }

    startVoiceInput() {
        if (this.recognition) {
            this.recognition.start();
            UI.showVoiceInputActive();
        } else {
            UI.showError('Speech recognition not supported in your browser');
        }
    }

    stopVoiceInput() {
        if (this.recognition) {
            this.recognition.stop();
            UI.hideVoiceInputActive();
        }
    }

    speakResponse(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = Settings.get('language');
        window.speechSynthesis.speak(utterance);
    }

    clearHistory() {
        this.messageHistory = [];
        UI.clearMessages();
        UI.addMessage("Hello! I'm your AI assistant. How can I help you today?", 'ai');
    }
}

// Create global chat instance
const Chat = new ChatManager();

class ChatHandler {
    constructor() {
        this.socket = io(CONFIG.SOCKET_URL);
        this.messageContainer = document.getElementById('messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-message');
        this.voiceButton = document.getElementById('voice-input');
        this.attachButton = document.getElementById('attach-file');
        this.fileInput = document.getElementById('file-input');
        this.loadingIndicator = document.getElementById('loading-indicator');
        
        this.setupEventListeners();
        this.setupSocketListeners();
    }

    setupEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());

        // Send message on Enter (but new line on Shift+Enter)
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = this.userInput.scrollHeight + 'px';
        });

        // Voice input handling
        this.voiceButton.addEventListener('click', () => this.toggleVoiceInput());

        // File attachment handling
        this.attachButton.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('message', (message) => {
            this.displayMessage(message, false);
        });

        this.socket.on('typing', () => {
            this.showTypingIndicator();
        });

        this.socket.on('error', (error) => {
            this.showError(error.message);
        });
    }

    sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Display user message
        this.displayMessage({ text: message }, true);

        // Clear input
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        // Show loading indicator
        this.showLoading();

        // Send to server
        this.socket.emit('message', { text: message }, (response) => {
            this.hideLoading();
            if (response.error) {
                this.showError(response.error);
            }
        });
    }

    displayMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

        const avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = isUser ? 'assets/user-avatar.png' : 'assets/ai-avatar.png';
        avatar.alt = isUser ? 'User' : 'AI';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>${this.formatMessage(message.text)}</p>`;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        this.messageContainer.appendChild(messageDiv);

        // Scroll to bottom
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    formatMessage(text) {
        // Convert URLs to links
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        // Convert newlines to <br>
        return text.replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        this.messageContainer.appendChild(indicator);
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    showLoading() {
        this.loadingIndicator.style.display = 'flex';
    }

    hideLoading() {
        this.loadingIndicator.style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.messageContainer.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    async toggleVoiceInput() {
        if (!('webkitSpeechRecognition' in window)) {
            this.showError('Voice input is not supported in this browser');
            return;
        }

        // Toggle voice input logic here
        this.voiceButton.classList.toggle('voice-input-active');
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            // Handle file upload logic here
            this.sendMessage(`[File Uploaded: ${file.name}]`);
        };
        reader.readAsDataURL(file);
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatHandler = new ChatHandler();
}); 