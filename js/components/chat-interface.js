/**
 * Chat Interface - Handles chat messaging and display
 */
class ChatInterface {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    addUserMessage(content, shouldTruncate = true) {
        this.addChatMessage('user', content, shouldTruncate);
    }

    addSystemMessage(content) {
        this.addChatMessage('system', content);
    }

    displayMentorResponse(analysis) {
        if (window.app && window.app.mentorFormatter) {
            const formattedResponse = window.app.mentorFormatter.formatMentorAnalysis(analysis);
            this.addChatMessage('mentor', formattedResponse);
        } else {
            this.addChatMessage('mentor', 'Analysis received but formatting module not available.');
        }
    }

    addChatMessage(type, content, shouldTruncate = false) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        let avatarImg = '';
        if (type === 'mentor') {
            const mentor = this.stateManager.getSelectedMentor();
            if (mentor && MentorConfig.mentors[mentor]) {
                avatarImg = MentorConfig.mentors[mentor].avatar;
            }
        } else if (type === 'user') {
            avatarImg = 'headshots/User.png';
        }

        const formattedContent = content.replace(/\n/g, '<br>');
        const shouldShowTruncation = shouldTruncate && content.length > 300;
        
        const contentDiv = shouldShowTruncation 
            ? this.createTruncatedContent(formattedContent)
            : `<p>${formattedContent}</p>`;

        messageDiv.innerHTML = `
            ${avatarImg ? `
                <div class="message-avatar">
                    <img src="${avatarImg}" alt="${type}">
                </div>
            ` : ''}
            <div class="message-content">
                ${contentDiv}
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    createTruncatedContent(content) {
        const truncatedId = `truncated-${Date.now()}`;
        return `
            <div id="${truncatedId}" class="truncated">
                <p>${content}</p>
            </div>
            <button class="expand-toggle" onclick="
                const contentDiv = this.parentNode.querySelector('#${truncatedId}');
                const isCurrentlyTruncated = contentDiv.classList.contains('truncated');
                
                if (isCurrentlyTruncated) {
                    contentDiv.classList.remove('truncated');
                    this.textContent = 'Show less';
                } else {
                    contentDiv.classList.add('truncated');
                    this.textContent = 'Show more';
                }
            ">
                Show more
            </button>
        `;
    }

    clearMessages() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    getMessageCount() {
        const chatMessages = document.getElementById('chatMessages');
        return chatMessages ? chatMessages.children.length : 0;
    }

    removeLastMessage() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages && chatMessages.lastChild) {
            chatMessages.removeChild(chatMessages.lastChild);
        }
    }

    updateTypingIndicator(isTyping) {
        const existingIndicator = document.querySelector('.typing-indicator');
        
        if (isTyping && !existingIndicator) {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message mentor-message typing-indicator';
            
            const mentor = this.stateManager.getSelectedMentor();
            const avatarImg = mentor && MentorConfig.mentors[mentor] 
                ? MentorConfig.mentors[mentor].avatar 
                : '';

            typingDiv.innerHTML = `
                ${avatarImg ? `
                    <div class="message-avatar">
                        <img src="${avatarImg}" alt="mentor">
                    </div>
                ` : ''}
                <div class="message-content">
                    <p><em>Your mentor is analyzing...</em></p>
                </div>
            `;

            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.appendChild(typingDiv);
                this.scrollToBottom();
            }
        } else if (!isTyping && existingIndicator) {
            existingIndicator.remove();
        }
    }
}

// Export for module usage
window.ChatInterface = ChatInterface;