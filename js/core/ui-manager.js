/**
 * UI Manager - Handles page navigation and DOM manipulation
 */
class UIManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.selectionInProgress = false;
    }

    showPage(pageId) {
        console.log(`🎯 showPage called with: ${pageId}`);
        
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(pageId);
        console.log(`🔍 Target page element:`, targetPage);
        
        if (targetPage) {
            targetPage.classList.add('active');
            this.stateManager.setCurrentPage(pageId);
            console.log(`📄 Successfully showing page: ${pageId}`);
        } else {
            console.error(`❌ Page element not found: ${pageId}`);
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            console.log('🖱️ Click detected on:', e.target);
            
            // Check if click is on mentor card or its children
            const mentorCard = e.target.closest('.mentor-card');
            if (mentorCard) {
                console.log('✅ Mentor card found:', mentorCard);
                this.handleMentorSelection(mentorCard);
            }
            
            // Check if click is on type card or its children
            const typeCard = e.target.closest('.type-card');
            if (typeCard) {
                this.handleInterviewTypeSelection(typeCard);
            }
            
            if (e.target.matches('#proceedBtn')) {
                this.handleProceedToChat();
            }
            
            if (e.target.matches('#sendBtn')) {
                this.handleSendMessage();
            }
            
            if (e.target.matches('#recordBtn')) {
                this.handleToggleRecording();
            }
            
            if (e.target.matches('#uploadBtn')) {
                this.handleAudioUpload();
            }
            
            if (e.target.matches('#loadDemoBtn')) {
                this.handleLoadDemo();
            }
            
            if (e.target.matches('#beginJourneyBtn')) {
                this.handleBeginJourney();
            }
            
            if (e.target.matches('.back-btn')) {
                this.handleBackToWelcome();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.matches('#audioFile')) {
                this.handleAudioFileChange(e);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.target.matches('#transcriptInput') && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
    }

    handleMentorSelection(element) {
        // Prevent double-clicks
        if (this.selectionInProgress) {
            console.log('⚠️ Selection already in progress, ignoring...');
            return;
        }
        
        this.selectionInProgress = true;
        console.log('🎯 handleMentorSelection called with:', element);
        console.log('📋 Element dataset:', element.dataset);
        
        this.clearSelections('.mentor-card');
        element.classList.add('selected');
        
        const mentorId = element.dataset.mentor;
        console.log('🧙 Mentor ID:', mentorId);
        
        try {
            this.stateManager.setSelectedMentor(mentorId);
            console.log('💾 State manager updated successfully');
        } catch (error) {
            console.error('❌ Error setting mentor in state manager:', error);
        }
        
        console.log(`✅ Selected mentor: ${mentorId}`);
        console.log('⏱️ Setting up auto-advance timer...');
        
        // Auto-advance to interview type selection after short delay
        setTimeout(() => {
            console.log('🚀 Auto-advancing to interview type page...');
            console.log('🎯 Calling showPage with interviewTypePage');
            this.showPage('interviewTypePage');
            
            // Reset the selection flag after navigation
            setTimeout(() => {
                this.selectionInProgress = false;
            }, 100);
        }, 800);
    }

    handleInterviewTypeSelection(element) {
        this.clearSelections('.type-card');
        element.classList.add('selected');
        
        const typeId = element.dataset.type;
        this.stateManager.setSelectedInterviewType(typeId);
        
        console.log(`📋 Selected interview type: ${typeId}`);
        
        // Auto-advance to chat interface after setup
        setTimeout(() => {
            this.setupChatInterface();
            this.showPage('chatPage');
        }, 800);
    }

    handleBeginJourney() {
        console.log('🚀 Begin Journey button clicked');
        this.showPage('mentorPage');
    }

    clearSelections(selector) {
        document.querySelectorAll(selector).forEach(card => {
            card.classList.remove('selected');
        });
    }

    updateProceedButton() {
        const proceedBtn = document.getElementById('proceedBtn');
        const canProceed = this.stateManager.getSelectedMentor() && 
                          this.stateManager.getSelectedInterviewType();
        
        if (proceedBtn) {
            proceedBtn.disabled = !canProceed;
            proceedBtn.textContent = canProceed ? 
                'Begin Training Session' : 
                'Select Mentor & Interview Type';
        }
    }

    handleProceedToChat() {
        if (this.stateManager.getSelectedMentor() && this.stateManager.getSelectedInterviewType()) {
            this.showPage('chatPage');
            this.setupChatInterface();
        }
    }

    setupChatInterface() {
        const mentor = this.stateManager.getSelectedMentor();
        const mentorData = MentorConfig.mentors[mentor];
        const interviewType = this.stateManager.getSelectedInterviewType();
        
        const mentorName = document.getElementById('mentorName');
        const mentorAvatar = document.getElementById('mentorAvatar');
        const interviewBadge = document.getElementById('interviewBadge');
        
        if (mentorName) mentorName.textContent = mentorData.name;
        if (mentorAvatar) mentorAvatar.src = mentorData.avatar;
        if (interviewBadge) interviewBadge.textContent = interviewType;
        
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
            this.addWelcomeMessage(mentorData.greeting);
        }
        
        console.log(`💬 Chat interface setup for ${mentorData.name}`);
    }

    addWelcomeMessage(greeting) {
        const mentor = this.stateManager.getSelectedMentor();
        const mentorData = MentorConfig.mentors[mentor];
        
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message mentor-message';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="${mentorData.avatar}" alt="mentor">
            </div>
            <div class="message-content">
                <p>${greeting}</p>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    handleSendMessage() {
        if (window.app && window.app.apiService) {
            window.app.apiService.sendToMentor();
        }
    }

    handleToggleRecording() {
        if (window.app && window.app.audioManager) {
            window.app.audioManager.toggleRecording();
        }
    }

    handleAudioUpload() {
        const audioFileInput = document.getElementById('audioFile');
        if (audioFileInput) {
            audioFileInput.click();
        } else {
            console.error('❌ Audio file input not found');
        }
    }

    handleAudioFileChange(event) {
        if (window.app && window.app.audioManager) {
            window.app.audioManager.handleAudioUpload(event);
        }
    }

    handleLoadDemo() {
        const interviewType = this.stateManager.getSelectedInterviewType();
        const demoData = MentorConfig.demoData[interviewType] || MentorConfig.demoData.behavioral;
        
        const transcriptInput = document.getElementById('transcriptInput');
        if (transcriptInput) {
            transcriptInput.value = demoData;
        }
        
        this.showAudioStatus('Demo transcript loaded successfully!', 'success');
    }

    setupChatInterface() {
        const selectedMentor = this.stateManager.getSelectedMentor();
        const selectedInterviewType = this.stateManager.getSelectedInterviewType();
        const mentor = MentorConfig.mentors[selectedMentor];
        
        if (!mentor) {
            console.error('❌ No mentor selected for chat setup');
            return;
        }
        
        // Update chat header with selected mentor info
        const mentorAvatar = document.getElementById('selectedMentorAvatar');
        const mentorName = document.getElementById('selectedMentorName');
        const interviewType = document.getElementById('selectedInterviewType');
        const chatMentorImg = document.getElementById('chatMentorImg');
        const initialGreeting = document.getElementById('initialMentorGreeting');
        
        if (mentorAvatar) mentorAvatar.src = mentor.avatar;
        if (mentorName) mentorName.textContent = mentor.name;
        if (interviewType) interviewType.textContent = selectedInterviewType.toUpperCase();
        if (chatMentorImg) chatMentorImg.src = mentor.avatar;
        if (initialGreeting) initialGreeting.textContent = mentor.greeting;
        
        // Clear any previous chat messages (except the initial greeting)
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const messages = chatMessages.querySelectorAll('.message:not(:first-child)');
            messages.forEach(msg => msg.remove());
        }
        
        console.log(`💬 Chat interface setup completed for ${mentor.name} - ${selectedInterviewType}`);
    }

    handleBackToWelcome() {
        this.stateManager.reset();
        this.clearSelections('.mentor-card, .type-card');
        
        const transcriptInput = document.getElementById('transcriptInput');
        if (transcriptInput) {
            transcriptInput.value = '';
        }
        
        // Reset follow-up suggestions
        if (window.app && window.app.followupManager) {
            window.app.followupManager.reset();
        }
        
        this.showPage('welcomePage');
    }

    showAudioStatus(message, type) {
        const statusDiv = document.getElementById('audioStatus');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `audio-status ${type}`;
            
            if (type === 'success') {
                setTimeout(() => {
                    statusDiv.textContent = '';
                    statusDiv.className = 'audio-status';
                }, 3000);
            }
        }
    }
}

// Export for module usage
window.UIManager = UIManager;