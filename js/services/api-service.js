/**
 * API Service - Handles backend communication
 */
class APIService {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    async sendToMentor() {
        const transcript = document.getElementById('transcriptInput').value.trim();
        if (!transcript) {
            this.showError('Please provide an interview transcript first, young apprentice.');
            return;
        }

        if (window.app && window.app.chatInterface) {
            window.app.chatInterface.addUserMessage(transcript);
        }
        
        document.getElementById('transcriptInput').value = '';
        this.showProcessingMessage();

        try {
            const response = await fetch(`${this.stateManager.getApiUrl()}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    transcript,
                    mentor: this.stateManager.getSelectedMentor(),
                    interviewType: this.stateManager.getSelectedInterviewType()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Analysis failed');
            }

            this.hideProcessingMessage();
            
            if (window.app && window.app.chatInterface) {
                window.app.chatInterface.displayMentorResponse(data.analysis);
            }

            // Enable follow-up suggestions after successful mentor response
            console.log('🔍 DEBUG: Attempting to enable followups...');
            console.log('🔍 DEBUG: window.app exists:', !!window.app);
            console.log('🔍 DEBUG: followupManager exists:', !!window.app?.followupManager);
            
            if (window.app && window.app.followupManager) {
                console.log('🔍 DEBUG: Calling enableFollowups with:', {
                    transcriptLength: transcript.length,
                    responseLength: data.analysis.length
                });
                
                window.app.followupManager.enableFollowups({
                    originalTranscript: transcript,
                    mentorResponse: data.analysis
                });
                
                console.log('🔍 DEBUG: enableFollowups called successfully');
            } else {
                console.error('❌ DEBUG: Cannot enable followups - missing dependencies');
            }

        } catch (error) {
            console.error('Mentor feedback error:', error);
            this.hideProcessingMessage();
            
            if (window.app && window.app.chatInterface) {
                window.app.chatInterface.addSystemMessage(`The Force is disturbed. Error: ${error.message}`);
            }
        }
    }

    showError(message) {
        if (window.app && window.app.uiManager) {
            window.app.uiManager.showAudioStatus(message, 'error');
        }
    }

    showProcessingMessage() {
        if (window.app && window.app.chatInterface) {
            window.app.chatInterface.addSystemMessage('⚡ Your mentor is analyzing the Force within your performance...');
        }
    }

    hideProcessingMessage() {
        const systemMessages = document.querySelectorAll('.system-message');
        const lastSystemMessage = systemMessages[systemMessages.length - 1];
        if (lastSystemMessage && lastSystemMessage.textContent.includes('analyzing')) {
            lastSystemMessage.remove();
        }
    }

    async testConnection() {
        try {
            const response = await fetch(`${this.stateManager.getApiUrl()}/health`);
            return response.ok;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
}

// Export for module usage
window.APIService = APIService;