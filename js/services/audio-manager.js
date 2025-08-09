/**
 * Audio Manager - Handles recording and transcription with fallback support
 */
class AudioManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.isAudioSupported = false;
        this.initializeAudioHandler();
    }

    initializeAudioHandler() {
        this.getBrowserCompatibilityInfo();
        this.checkAudioSupport();
        
        this.stateManager.setAudioHandler({
            processAudio: async () => console.log('Audio processing placeholder')
        });
        
        if (this.isAudioSupported) {
            console.log('✅ Audio recording enabled');
        } else {
            console.log('⚠️ Audio recording not available - upload and Whisper API only');
            this.disableRecordButton();
            this.showFallbackMessage();
        }
    }

    showFallbackMessage() {
        setTimeout(() => {
            const compatibility = this.getBrowserCompatibilityInfo();
            let message = '🔧 Audio recording unavailable. ';
            
            if (!compatibility.isSecureContext) {
                message += 'Try using HTTPS or localhost. ';
            }
            if (!compatibility.hasGetUserMedia && !compatibility.hasLegacyGetUserMedia) {
                message += 'Browser doesn\'t support audio recording. ';
            }
            
            message += 'Use file upload or demo data instead.';
            
            this.showStatus(message, 'info');
        }, 1000);
    }

    checkAudioSupport() {
        // Check for modern API
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            this.isAudioSupported = true;
            console.log('✅ Modern getUserMedia API available');
            return;
        }

        // Check for legacy API
        const getUserMedia = navigator.getUserMedia || 
                           navigator.webkitGetUserMedia || 
                           navigator.mozGetUserMedia || 
                           navigator.msGetUserMedia;

        if (getUserMedia) {
            this.isAudioSupported = true;
            console.log('✅ Legacy getUserMedia API available');
            // Polyfill for older browsers
            navigator.mediaDevices = {
                getUserMedia: (constraints) => {
                    return new Promise((resolve, reject) => {
                        getUserMedia.call(navigator, constraints, resolve, reject);
                    });
                }
            };
            return;
        }

        this.isAudioSupported = false;
        console.log('❌ No audio recording API available');
    }

    disableRecordButton() {
        setTimeout(() => {
            const recordBtn = document.getElementById('recordBtn');
            if (recordBtn) {
                recordBtn.disabled = true;
                recordBtn.textContent = '🚫 Recording Not Available';
                recordBtn.title = 'Audio recording requires HTTPS or newer browser. Use file upload or Whisper API instead.';
            }
        }, 100);
    }

    async toggleRecording() {
        if (!this.isAudioSupported) {
            this.showStatus('Audio recording not available. Please use file upload instead.', 'error');
            return;
        }

        const recordBtn = document.getElementById('recordBtn');
        if (!this.stateManager.isCurrentlyRecording()) {
            await this.startRecording();
            if (recordBtn) {
                recordBtn.textContent = '⏹️ Stop';
                recordBtn.classList.add('recording');
            }
        } else {
            await this.stopRecording();
            if (recordBtn) {
                recordBtn.textContent = '🎤 Record';
                recordBtn.classList.remove('recording');
            }
        }
    }

    async startRecording() {
        if (!this.isAudioSupported) {
            this.showStatus('Recording not supported in this environment', 'error');
            return;
        }

        try {
            // Request permission and get audio stream
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
            
            // Check if MediaRecorder is supported
            if (!window.MediaRecorder) {
                throw new Error('MediaRecorder not supported in this browser');
            }

            const mediaRecorder = new MediaRecorder(stream);
            this.stateManager.setMediaRecorder(mediaRecorder);
            this.stateManager.clearAudioChunks();
            
            mediaRecorder.ondataavailable = (event) => {
                this.stateManager.addAudioChunk(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.stateManager.getAudioChunks(), { type: 'audio/wav' });
                this.processAudio(audioBlob, 'recorded_audio.wav');
            };
            
            mediaRecorder.start();
            this.stateManager.setRecordingState(true);
            
            this.showStatus('🎤 Recording in progress...', 'recording');
            console.log('🎤 Started recording');
            
        } catch (error) {
            console.error('Recording start error:', error);
            
            let errorMessage = 'Recording failed: ';
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Microphone permission denied. Please allow microphone access and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No microphone found. Please connect a microphone and try again.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage += 'Recording not supported. Please use file upload instead.';
            } else if (error.message.includes('HTTPS')) {
                errorMessage += 'HTTPS required for microphone access. Please use file upload or serve over HTTPS.';
            } else {
                errorMessage += error.message + '. Please try file upload instead.';
            }
            
            this.showStatus(errorMessage, 'error');
            this.suggestAlternatives();
        }
    }

    async stopRecording() {
        const mediaRecorder = this.stateManager.getMediaRecorder();
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            this.stateManager.setRecordingState(false);
            this.showStatus('⏹️ Recording stopped, processing...', 'processing');
            console.log('⏹️ Stopped recording');
        }
    }

    async handleAudioUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            this.showStatus('Please select an audio file.', 'error');
            return;
        }

        console.log('📂 Processing uploaded audio file:', file.name);
        this.processAudio(file, file.name);
    }

    async processAudio(audioBlob, filename) {
        this.showStatus('🔊 Processing audio...', 'processing');
        
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, filename);

            console.log(`🔊 Sending ${filename} for transcription...`);
            
            const response = await fetch(`${this.stateManager.getApiUrl()}/transcribe`, {
                method: 'POST',
                body: formData
            });

            let data;
            console.log('🔍 Response status:', response.status);
            console.log('🔍 Response headers:', response.headers.get('content-type'));
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                console.log('🔍 JSON server response:', data);
            } else {
                // Server returned HTML (error page) instead of JSON
                const htmlText = await response.text();
                console.error('❌ Server returned HTML instead of JSON:', htmlText.substring(0, 200));
                throw new Error(`Server error (${response.status}): Check backend console for details`);
            }

            if (!response.ok) {
                console.error('❌ Server error response:', data);
                throw new Error(data.error || 'Transcription failed');
            }

            console.log('✅ Transcription completed successfully');
            console.log('📊 Full transcription response structure:', JSON.stringify(data, null, 2));
            
            // Handle different response formats with detailed logging
            let transcript = '';
            console.log('🔎 Checking response format...');
            
            if (data.transcript) {
                console.log('✅ Found data.transcript:', data.transcript);
                transcript = data.transcript;
            } else if (data.transcription && data.transcription.text) {
                console.log('✅ Found data.transcription.text:', data.transcription.text);
                transcript = data.transcription.text;
            } else if (data.text) {
                console.log('✅ Found data.text:', data.text);
                transcript = data.text;
            } else {
                console.error('❌ No transcript found in any expected format!');
                console.log('Available keys:', Object.keys(data));
            }
            
            // Format the transcript with timeline if available
            let formattedTranscript = transcript;
            console.log('🔍 Timeline data available:', !!data.timeline);
            console.log('🔍 Timeline length:', data.timeline ? data.timeline.length : 'N/A');
            console.log('🔍 Entities data:', data.entities);
            
            if (data.timeline && data.timeline.length > 0) {
                console.log('📅 Formatting transcript with timeline data');
                console.log('📅 Timeline preview:', data.timeline.slice(0, 2));
                formattedTranscript = this.formatTranscriptWithTimeline(data.timeline, data.entities);
                console.log('✅ Formatted transcript created, length:', formattedTranscript.length);
            } else {
                console.log('⚠️ No timeline data available, using plain transcript');
            }
            
            console.log('📝 Final formatted transcript (preview):', formattedTranscript.substring(0, 300) + '...');
            this.handleTranscriptionResult(formattedTranscript);
            
        } catch (error) {
            console.error('Audio processing error:', error);
            this.showStatus(`Transcription failed: ${error.message}`, 'error');
        }
    }

    handleTranscriptionResult(transcript) {
        if (!transcript || transcript.trim().length === 0) {
            this.showStatus('No speech detected in the audio. Please try again.', 'error');
            return;
        }

        const transcriptInput = document.getElementById('transcriptInput');
        if (transcriptInput) {
            transcriptInput.value = transcript;
            this.showStatus('✅ Audio transcribed successfully!', 'success');
        }

        console.log('📝 Transcription result:', transcript.substring(0, 100) + '...');
    }

    suggestAlternatives() {
        setTimeout(() => {
            this.showStatus('💡 Tip: Try the Upload button or use the Load Demo feature instead!', 'info');
        }, 3000);
    }

    showStatus(message, type) {
        if (window.app && window.app.uiManager) {
            window.app.uiManager.showAudioStatus(message, type);
        }
    }

    formatTranscriptWithTimeline(timeline, entities) {
        let formatted = '';
        
        // Add header
        formatted += '📅 INTERVIEW TIMELINE & TRANSCRIPT\n';
        formatted += '═══════════════════════════════════════\n\n';
        
        // Add entities if available
        if (entities) {
            formatted += '🏷️ KEY ENTITIES DETECTED:\n';
            if (entities.names && entities.names.length > 0) {
                formatted += `👤 Names: ${entities.names.join(', ')}\n`;
            }
            if (entities.companies && entities.companies.length > 0) {
                formatted += `🏢 Companies: ${entities.companies.join(', ')}\n`;
            }
            if (entities.technologies && entities.technologies.length > 0) {
                formatted += `💻 Technologies: ${entities.technologies.join(', ')}\n`;
            }
            formatted += '\n';
        }
        
        // Add timeline sections
        formatted += '⏰ TIMELINE BREAKDOWN:\n';
        formatted += '─────────────────────────\n\n';
        
        timeline.forEach((section, index) => {
            const sectionName = section.section.replace('_', ' ').toUpperCase();
            const endTime = section.end || '(ongoing)';
            
            formatted += `${section.start} - ${endTime} | ${sectionName}\n`;
            formatted += `${section.content}\n\n`;
        });
        
        return formatted;
    }

    getBrowserCompatibilityInfo() {
        const info = {
            hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            hasLegacyGetUserMedia: !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia),
            hasMediaRecorder: !!window.MediaRecorder,
            isSecureContext: window.isSecureContext,
            protocol: window.location.protocol
        };
        
        console.log('🔍 Browser compatibility info:', info);
        return info;
    }

    cleanup() {
        const mediaRecorder = this.stateManager.getMediaRecorder();
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            if (mediaRecorder.stream) {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
        }
        this.stateManager.setRecordingState(false);
    }
}

// Export for module usage
window.AudioManager = AudioManager;