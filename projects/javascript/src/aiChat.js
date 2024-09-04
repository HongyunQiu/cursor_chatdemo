class AIChat {
    constructor() {
        this.messages = [];
        this.chatHistory = [];
        this.currentChatId = null;
        this.initEventListeners();
        this.loadChatHistory();
    }

    initEventListeners() {
        document.getElementById('chatForm').addEventListener('submit', this.handleSendMessage.bind(this));
        document.getElementById('newChatBtn').addEventListener('click', this.startNewChat.bind(this));
    }

    async handleSendMessage(e) {
        e.preventDefault();
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value;
        if (!message) return;

        this.addMessageToUI('user', message);
        messageInput.value = '';

        try {
            const response = await this.sendMessage(message);
            console.log('Received response:', response);
            this.addMessageToUI('assistant', response);
            this.saveChatHistory();
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessageToUI('error', 'Failed to send message. Please try again.');
        }
    }

    async sendMessage(message) {
        const response = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        if (!response.ok) {
            throw new Error('Failed to send message');
        }
        const data = await response.json();
        return data.message;
    }

    addMessageToUI(role, content) {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}`;
        messageElement.textContent = content;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        this.messages.push({ role, content });
    }

    saveChatHistory() {
        if (!this.currentChatId) {
            this.currentChatId = Date.now();
        }
        const preview = this.messages[0].content.substring(0, 30) + '...';
        const existingChatIndex = this.chatHistory.findIndex(chat => chat.id === this.currentChatId);
        
        if (existingChatIndex !== -1) {
            this.chatHistory[existingChatIndex] = { id: this.currentChatId, preview, messages: [...this.messages] };
        } else {
            this.chatHistory.unshift({ id: this.currentChatId, preview, messages: [...this.messages] });
        }
        
        localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
        this.updateChatHistoryUI();
    }

    loadChatHistory() {
        const storedHistory = localStorage.getItem('chatHistory');
        if (storedHistory) {
            this.chatHistory = JSON.parse(storedHistory);
            this.updateChatHistoryUI();
        }
    }

    updateChatHistoryUI() {
        const chatHistoryList = document.getElementById('chatHistoryList');
        chatHistoryList.innerHTML = '';
        this.chatHistory.forEach(chat => {
            const li = document.createElement('li');
            li.textContent = chat.preview;
            li.addEventListener('click', () => this.loadChat(chat.id));
            chatHistoryList.appendChild(li);
        });
    }

    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (chat) {
            this.currentChatId = chatId;
            this.messages = [...chat.messages];
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = '';
            this.messages.forEach(msg => this.addMessageToUI(msg.role, msg.content));
        }
    }

    startNewChat() {
        if (this.messages.length > 0) {
            this.saveChatHistory();
        }
        this.currentChatId = null;
        this.messages = [];
        document.getElementById('chatMessages').innerHTML = '';
        document.getElementById('messageInput').value = '';
    }
}

// Initialize AIChat instance
document.addEventListener('DOMContentLoaded', () => {
    new AIChat();
});
