/**
 * Follow-up Manager - Handles intelligent follow-up suggestions
 */
class FollowupManager {
    constructor(stateManager, apiService) {
        this.stateManager = stateManager;
        this.apiService = apiService;
        this.followupEnabled = false;
        this.lastConversationContext = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Follow-up button click
        document.addEventListener('click', (e) => {
            if (e.target.matches('#suggestedFollowupBtn')) {
                this.handleFollowupButtonClick();
            }
            
            if (e.target.matches('.followup-close')) {
                this.closeFollowupModal();
            }
            
            // Handle suggestion clicks (including clicks on child elements)
            const suggestionEl = e.target.closest('.followup-suggestion');
            if (suggestionEl) {
                this.handleSuggestionClick(suggestionEl);
            }
        });

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.matches('#followupModal')) {
                this.closeFollowupModal();
            }
        });
    }

    /**
     * Enable follow-up suggestions after mentor provides feedback
     */
    enableFollowups(conversationContext) {
        console.log('💡 DEBUG: enableFollowups called with context:', conversationContext);
        console.log('💡 DEBUG: Setting followupEnabled to true');
        
        this.followupEnabled = true;
        this.lastConversationContext = conversationContext;
        
        const followupBtn = document.getElementById('suggestedFollowupBtn');
        console.log('💡 DEBUG: followupBtn element found:', !!followupBtn);
        
        if (followupBtn) {
            console.log('💡 DEBUG: Enabling button - before state:', {
                disabled: followupBtn.disabled,
                textContent: followupBtn.textContent,
                opacity: followupBtn.style.opacity
            });
            
            followupBtn.disabled = false;
            followupBtn.textContent = '💡 Suggested Follow-up';
            followupBtn.style.opacity = '1';
            
            console.log('💡 DEBUG: Enabling button - after state:', {
                disabled: followupBtn.disabled,
                textContent: followupBtn.textContent,
                opacity: followupBtn.style.opacity
            });
        } else {
            console.error('❌ DEBUG: suggestedFollowupBtn element not found in DOM');
        }
    }

    /**
     * Disable follow-up suggestions (e.g., when starting new conversation)
     */
    disableFollowups() {
        console.log('🔒 Disabling follow-up suggestions');
        this.followupEnabled = false;
        this.lastConversationContext = null;
        
        const followupBtn = document.getElementById('suggestedFollowupBtn');
        if (followupBtn) {
            followupBtn.disabled = true;
            followupBtn.textContent = '💡 Suggested Follow-up';
            followupBtn.style.opacity = '0.5';
        }
    }

    /**
     * Handle follow-up button click
     */
    async handleFollowupButtonClick() {
        if (!this.followupEnabled || !this.lastConversationContext) {
            console.log('⚠️ Follow-ups not enabled or no context available');
            return;
        }

        console.log('🎯 Generating follow-up suggestions...');
        this.showLoadingState();

        try {
            const suggestions = await this.generateFollowups();
            this.showFollowupModal(suggestions);
        } catch (error) {
            console.error('❌ Failed to generate follow-ups:', error);
            this.showError('Failed to generate suggestions. Please try again.');
        }
    }

    /**
     * Generate follow-up suggestions from backend
     */
    async generateFollowups() {
        const requestData = {
            originalTranscript: this.lastConversationContext.originalTranscript,
            mentorResponse: this.lastConversationContext.mentorResponse,
            mentor: this.stateManager.getSelectedMentor(),
            interviewType: this.stateManager.getSelectedInterviewType(),
            conversationHistory: this.getConversationHistory()
        };
        
        console.log('🔍 DEBUG: Sending followup request to:', `${this.stateManager.getApiUrl()}/followup`);
        console.log('🔍 DEBUG: Request data:', requestData);
        
        const response = await fetch(`${this.stateManager.getApiUrl()}/followup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Received follow-up suggestions:', data);

        return data.suggestions || [];
    }

    /**
     * Get current conversation history
     */
    getConversationHistory() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return [];

        const messages = [];
        const messageElements = chatMessages.querySelectorAll('.message');

        messageElements.forEach(msgEl => {
            const isMentor = msgEl.classList.contains('mentor-message');
            const content = msgEl.querySelector('.message-content p')?.textContent || '';
            
            if (content.trim()) {
                messages.push({
                    role: isMentor ? 'assistant' : 'user',
                    content: content
                });
            }
        });

        return messages;
    }

    /**
     * Show loading state on follow-up button
     */
    showLoadingState() {
        const followupBtn = document.getElementById('suggestedFollowupBtn');
        if (followupBtn) {
            followupBtn.textContent = '⏳ Generating...';
            followupBtn.disabled = true;
        }
    }

    /**
     * Reset button state
     */
    resetButtonState() {
        const followupBtn = document.getElementById('suggestedFollowupBtn');
        if (followupBtn && this.followupEnabled) {
            followupBtn.textContent = '💡 Suggested Follow-up';
            followupBtn.disabled = false;
        }
    }

    /**
     * Show the follow-up suggestions modal
     */
    showFollowupModal(suggestions) {
        console.log('🎭 Showing follow-up modal with', suggestions.length, 'suggestions');
        
        const modal = document.getElementById('followupModal');
        const suggestionsContainer = document.getElementById('followupSuggestions');
        
        if (!modal || !suggestionsContainer) {
            console.error('❌ Modal elements not found');
            return;
        }

        // Clear previous suggestions
        suggestionsContainer.innerHTML = '';

        if (suggestions.length === 0) {
            suggestionsContainer.innerHTML = `
                <div class="no-suggestions">
                    <p>No additional suggestions available at this time.</p>
                    <p>Try asking your mentor for more specific details about their feedback.</p>
                </div>
            `;
        } else {
            // Create suggestion elements
            suggestions.forEach((suggestion, index) => {
                const suggestionEl = document.createElement('div');
                suggestionEl.className = 'followup-suggestion';
                suggestionEl.innerHTML = `
                    <div class="followup-suggestion-text">${suggestion.question}</div>
                    <div class="followup-suggestion-category">${suggestion.category}</div>
                `;
                
                // Store the question for click handling
                suggestionEl.dataset.question = suggestion.question;
                
                suggestionsContainer.appendChild(suggestionEl);
            });
        }

        // Show modal with animation
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        this.resetButtonState();
    }

    /**
     * Close the follow-up modal
     */
    closeFollowupModal() {
        const modal = document.getElementById('followupModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Handle clicking on a suggestion
     */
    handleSuggestionClick(suggestionElement) {
        const question = suggestionElement.dataset.question;
        if (!question) return;

        console.log('📝 Selected follow-up question:', question);

        // Insert the question into the transcript input
        const transcriptInput = document.getElementById('transcriptInput');
        if (transcriptInput) {
            transcriptInput.value = question;
            transcriptInput.focus();
            
            // Scroll to the input area
            transcriptInput.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }

        // Close the modal
        this.closeFollowupModal();

        // Optional: Show a success message
        if (window.app && window.app.uiManager) {
            window.app.uiManager.showAudioStatus('Follow-up question loaded! Click "Send to Mentor" when ready.', 'success');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error('❌ Follow-up error:', message);
        
        if (window.app && window.app.uiManager) {
            window.app.uiManager.showAudioStatus(message, 'error');
        }
        
        this.resetButtonState();
    }

    /**
     * Update conversation context when new mentor response is received
     */
    updateContext(originalTranscript, mentorResponse) {
        this.lastConversationContext = {
            originalTranscript: originalTranscript,
            mentorResponse: mentorResponse,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Reset all follow-up state (for new sessions)
     */
    reset() {
        this.disableFollowups();
        this.closeFollowupModal();
    }
}

// Export for module usage
window.FollowupManager = FollowupManager;