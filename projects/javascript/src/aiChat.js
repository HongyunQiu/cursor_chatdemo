class AIChat {
    constructor() {
        this.messages = [];
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('chatForm').addEventListener('submit', this.handleSendMessage.bind(this));
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
    }
}

// 初始化 AIChat 实例
document.addEventListener('DOMContentLoaded', () => {
    new AIChat();
});
