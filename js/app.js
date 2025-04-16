document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const messagesContainer = document.getElementById('messages');
    const chatContainer = document.querySelector('.chat-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-message');
    const voiceButton = document.getElementById('voice-input');
    const attachButton = document.getElementById('attach-file');
    const fileInput = document.getElementById('file-input');
    const clearButton = document.getElementById('clear-history');
    const settingsButton = document.getElementById('settings');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalButton = document.querySelector('.close-modal');
    const saveSettingsButton = document.getElementById('save-settings');
    const cancelSettingsButton = document.getElementById('cancel-settings');
    const logoutButton = document.getElementById('logout');

    // User preferences
    let userPreferences = {
        theme: 'light',
        fontSize: 'medium',
        voiceOutput: false,
        language: 'en-US',
        saveHistory: true
    };

    // Chat history management
    const CHAT_HISTORY_KEY = 'chat_history';
    let chatHistory = [];

    // Load chat history
    function loadChatHistory() {
        if (userPreferences.saveHistory) {
            const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
            if (savedHistory) {
                chatHistory = JSON.parse(savedHistory);
                displayChatHistory();
            }
        }
    }

    // Save chat history
    function saveChatHistory() {
        if (userPreferences.saveHistory) {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
        }
    }

    // Display chat history
    function displayChatHistory() {
        messagesContainer.innerHTML = '';
        chatHistory.forEach(chat => {
            addMessage(chat.message, chat.type, false); // Don't save to history when displaying
        });
    }

    // Format message
    function formatMessage(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="chat-link">$1</a>')
            .replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // Show typing indicator
    function showTypingIndicator() {
        hideTypingIndicator(); // First remove any existing indicator
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message typing-indicator';
        messageDiv.innerHTML = `
            <img src="assets/ai-avatar.svg" alt="AI" class="avatar">
            <div class="message-content">
                <div class="dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Hide typing indicator
    function hideTypingIndicator() {
        const indicators = document.querySelectorAll('.typing-indicator');
        indicators.forEach(indicator => indicator.remove());
    }

    // Generate AI response
    async function generateResponse(message) {
        console.log('Generating response for:', message);
        showTypingIndicator();

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            hideTypingIndicator(); // Hide indicator after getting response

            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }

            const data = await response.json();
            console.log('Server response:', data);

            if (data.message) {
                addMessage(data.message, 'ai');
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error generating response:', error);
            hideTypingIndicator(); // Ensure indicator is hidden even on error
            addMessage("I apologize, but I'm having trouble connecting to the AI service. Please try again.", 'system', false);
        }
    }

    // Add message to UI
    function addMessage(text, type, saveToHistory = true) {
        console.log('Adding message:', { type, text });
        
        // Don't add empty messages
        if (!text.trim() && type !== 'typing') return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message animate-message`;

        const avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = type === 'ai' ? 'assets/ai-avatar.svg' : 'assets/user-avatar.svg';
        avatar.alt = type === 'ai' ? 'AI' : 'User';

        const content = document.createElement('div');
        content.className = 'message-content';
        
        content.innerHTML = `<p>${formatMessage(text)}</p>`;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        content.appendChild(timestamp);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        messagesContainer.appendChild(messageDiv);
        
        // Smooth scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Save to history if needed
        if (saveToHistory && type !== 'typing' && type !== 'system') {
            chatHistory.push({
                type,
                message: text,
                timestamp: new Date().toISOString()
            });
            saveChatHistory();
        }
    }

    // Handle user message
    function handleUserMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        console.log('Handling user message:', message);
        
        // Add user message
        addMessage(message, 'user');
        
        // Clear input
        userInput.value = '';
        adjustTextareaHeight();

        // Generate AI response
        generateResponse(message);
    }

    // Improve textarea handling
    function adjustTextareaHeight() {
        userInput.style.height = 'auto';
        const newHeight = Math.min(userInput.scrollHeight, 150);
        userInput.style.height = newHeight + 'px';
        
        if (chatContainer) {
            const isMobile = window.innerWidth <= 768;
            chatContainer.style.paddingBottom = isMobile ? 
                (newHeight + 32) + 'px' : '1rem';
        }
    }

    // Initialize chat
    async function initChat() {
        console.log('Initializing chat...');
        loadPreferences();
        loadChatHistory();
        
        try {
            const healthCheck = await fetch('http://localhost:5000/api/health');
            const healthData = await healthCheck.json();
            console.log('Server health check:', healthData);
            
            if (healthData.status !== 'ok') {
                addMessage("Warning: Server might not be functioning properly.", 'system', false);
            }
        } catch (error) {
            console.error('Server health check failed:', error);
            addMessage("Warning: Cannot connect to the server. Please make sure the backend is running.", 'system', false);
        }

        if (messagesContainer.children.length === 0) {
            addMessage("Hello! I'm your AI assistant. How can I help you today?", 'ai');
        }
    }

    // Event Listeners
    userInput.addEventListener('input', adjustTextareaHeight);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessage();
        }
    });

    sendButton.addEventListener('click', handleUserMessage);
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the chat history?')) {
            chatHistory = [];
            saveChatHistory();
            messagesContainer.innerHTML = '';
            addMessage("Hello! I'm your AI assistant. How can I help you today?", 'ai');
        }
    });

    // Settings handlers
    settingsButton.addEventListener('click', () => settingsModal.style.display = 'flex');
    closeModalButton.addEventListener('click', () => settingsModal.style.display = 'none');
    saveSettingsButton.addEventListener('click', savePreferences);
    cancelSettingsButton.addEventListener('click', () => settingsModal.style.display = 'none');

    // File handling
    attachButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const message = `[File Attached: ${file.name}]`;
                addMessage(message, 'user');
                generateResponse(`The user has attached a file named ${file.name}. Please acknowledge this.`);
            };
            reader.readAsDataURL(file);
            fileInput.value = '';
        }
    });

    // Logout handling
    logoutButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            window.location.reload();
        }
    });

    // Initialize
    initChat();
}); 