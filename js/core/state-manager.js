/**
 * State Manager - Handles application state and data
 */
class StateManager {
    constructor() {
        this.API_URL = 'http://localhost:3001/api';
        this.currentPage = 'welcomePage';
        this.selectedMentor = null;
        this.selectedInterviewType = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioHandler = null;
    }

    setCurrentPage(page) {
        this.currentPage = page;
    }

    getCurrentPage() {
        return this.currentPage;
    }

    setSelectedMentor(mentor) {
        this.selectedMentor = mentor;
    }

    getSelectedMentor() {
        return this.selectedMentor;
    }

    setSelectedInterviewType(type) {
        this.selectedInterviewType = type;
    }

    getSelectedInterviewType() {
        return this.selectedInterviewType;
    }

    setRecordingState(isRecording) {
        this.isRecording = isRecording;
    }

    isCurrentlyRecording() {
        return this.isRecording;
    }

    setMediaRecorder(recorder) {
        this.mediaRecorder = recorder;
    }

    getMediaRecorder() {
        return this.mediaRecorder;
    }

    setAudioChunks(chunks) {
        this.audioChunks = chunks;
    }

    getAudioChunks() {
        return this.audioChunks;
    }

    addAudioChunk(chunk) {
        this.audioChunks.push(chunk);
    }

    clearAudioChunks() {
        this.audioChunks = [];
    }

    setAudioHandler(handler) {
        this.audioHandler = handler;
    }

    getAudioHandler() {
        return this.audioHandler;
    }

    reset() {
        this.selectedMentor = null;
        this.selectedInterviewType = null;
        this.currentPage = 'welcomePage';
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    getApiUrl() {
        return this.API_URL;
    }
}

// Export for module usage
window.StateManager = StateManager;