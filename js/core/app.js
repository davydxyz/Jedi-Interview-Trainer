/**
 * Star Wars Jedi Interview Training - Refactored Main Application
 * Now uses modular architecture with separated concerns
 */
class JediInterviewApp {
    constructor() {
        this.stateManager = new StateManager();
        this.uiManager = new UIManager(this.stateManager);
        this.apiService = new APIService(this.stateManager);
        this.audioManager = new AudioManager(this.stateManager);
        this.chatInterface = new ChatInterface(this.stateManager);
        this.mentorFormatter = new MentorFormatter(this.stateManager);
        this.followupManager = new FollowupManager(this.stateManager, this.apiService);
        
        this.initializeApp();
    }

    initializeApp() {
        this.uiManager.setupEventListeners();
        this.uiManager.showPage('welcomePage');
        
        console.log('✅ Jedi Interview App initialized with modular architecture');
        console.log('📦 Modules loaded:', {
            stateManager: !!this.stateManager,
            uiManager: !!this.uiManager,
            apiService: !!this.apiService,
            audioManager: !!this.audioManager,
            chatInterface: !!this.chatInterface,
            mentorFormatter: !!this.mentorFormatter,
            followupManager: !!this.followupManager
        });
    }

    async testConnection() {
        return await this.apiService.testConnection();
    }

    getState() {
        return {
            currentPage: this.stateManager.getCurrentPage(),
            selectedMentor: this.stateManager.getSelectedMentor(),
            selectedInterviewType: this.stateManager.getSelectedInterviewType(),
            isRecording: this.stateManager.isCurrentlyRecording()
        };
    }

    cleanup() {
        if (this.audioManager) {
            this.audioManager.cleanup();
        }
        
        if (this.followupManager) {
            this.followupManager.reset();
        }
        
        console.log('🧹 App cleanup completed');
    }
}

// Global app instance
let app = null;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        app = new JediInterviewApp();
        window.app = app; // Make available globally for module communication
        console.log('🚀 Jedi Interview Training App started successfully');
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.cleanup();
    }
});

// Error handler for uncaught errors
window.addEventListener('error', (event) => {
    console.error('🚨 Unhandled error:', event.error);
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JediInterviewApp;
}