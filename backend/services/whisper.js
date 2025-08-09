/**
 * OpenAI Whisper Transcription Service
 */

import OpenAI from 'openai';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Initialize OpenAI client only when needed
function getOpenAIClient() {
    console.log('🔑 Checking OpenAI API key...');
    console.log('🔍 API key exists:', !!process.env.OPENAI_API_KEY);
    console.log('🔍 API key preview:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 20) + '...' : 'NOT_SET');
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_key_here') {
        console.log('❌ OpenAI API key not properly configured');
        return null;
    }
    
    console.log('✅ OpenAI API key configured, creating client');
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

/**
 * Transcribe audio file using OpenAI Whisper
 */
export async function transcribeAudio(audioBuffer, filename) {
    try {
        console.log(`🎤 Starting transcription for: ${filename}`);
        
        const openai = getOpenAIClient();
        if (!openai) {
            console.log('⚠️ OpenAI API key not configured, using mock transcription');
            return getMockTranscription();
        }

        // Create File object for OpenAI API with proper MIME type
        const mimeType = filename.endsWith('.wav') ? 'audio/wav' : 
                        filename.endsWith('.webm') ? 'audio/webm' :
                        filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav';
                        
        console.log(`🎵 Audio file details: ${filename}, size: ${audioBuffer.length} bytes, type: ${mimeType}`);
        
        const audioFile = new File([audioBuffer], filename, {
            type: mimeType
        });

        console.log('🌐 Sending request to OpenAI Whisper API...');
        
        // Test basic connectivity first
        console.log('🔍 Testing OpenAI API connectivity...');
        try {
            const testResponse = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                timeout: 10000
            });
            console.log('✅ Basic OpenAI API connection test:', testResponse.status);
        } catch (testError) {
            console.log('❌ Basic connectivity test failed:', testError.message);
        }
        
        // Try alternative method using direct HTTP request
        console.log('🔄 Trying alternative HTTP method...');
        const transcription = await tryDirectAPICall(audioBuffer, filename, process.env.OPENAI_API_KEY);
        
        if (!transcription) {
            console.log('🔄 Falling back to OpenAI SDK method...');
            const sdkResult = await openai.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-1',
                language: 'en',
                response_format: 'verbose_json', // Get detailed response with timestamps
                timestamp_granularities: ['segment', 'word'], // Get both segment and word timestamps
                temperature: 0.0
            });
            transcription = sdkResult;
        }

        console.log('✅ Transcription completed');

        console.log('📝 Raw OpenAI response:', typeof transcription, transcription);
        
        // Handle different response formats (text vs verbose_json)
        const transcriptText = typeof transcription === 'string' ? transcription : transcription.text;
        
        // Extract detailed information from transcription
        const segments = transcription.segments || [];
        const words = transcription.words || []; // Word-level timestamps
        const timeline = generateTimeline(segments, words);
        const entities = extractEntities(transcriptText);
        
        return {
            success: true,
            transcription: {
                text: transcriptText,
                segments: segments,
                words: words,
                timeline: timeline,
                entities: entities,
                language: transcription.language || 'en',
                duration: transcription.duration || 0
            },
            metadata: {
                model: 'whisper-1',
                timestamp: new Date().toISOString(),
                filename: filename,
                fileSize: audioBuffer.length,
                segmentCount: segments.length
            }
        };

    } catch (error) {
        console.error('❌ Transcription failed:', error);
        
        // Analyze error type for better debugging
        if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || 
            (error.cause && (error.cause.code === 'ECONNRESET' || error.cause.code === 'ENOTFOUND'))) {
            console.log('🌐 Network connectivity issue detected - connection reset or DNS failure');
        } else if (error.status === 401) {
            console.log('🔑 Authentication issue - check API key');
        } else if (error.status === 429) {
            console.log('💳 Quota exceeded - need to add credits to OpenAI account');
            console.log('💡 Visit: https://platform.openai.com/usage');
        } else if (error.status >= 500) {
            console.log('🚨 OpenAI server error');
        } else if (error.constructor.name === 'APIConnectionError') {
            console.log('🔌 OpenAI API connection error - network or firewall issue');
        } else {
            console.log('❓ Unknown error type:', error.constructor.name, 'Code:', error.code);
        }
        
        // Fallback to mock transcription
        console.log('🔄 Falling back to mock transcription');
        return getMockTranscription();
    }
}

/**
 * Generate timeline summary from transcript segments
 */
function generateTimeline(segments, words = []) {
    if (!segments || segments.length === 0) {
        return [];
    }
    
    console.log('📊 Generating timeline from', segments.length, 'segments and', words.length, 'words');

    const timeline = [];
    let currentSection = null;
    let sectionStart = 0;

    segments.forEach((segment, index) => {
        const text = segment.text.trim();
        const timestamp = formatTimestamp(segment.start);
        
        // Detect section changes based on content patterns
        const sectionType = detectSectionType(text);
        
        if (sectionType !== currentSection) {
            // Close previous section
            if (currentSection && timeline.length > 0) {
                timeline[timeline.length - 1].end = formatTimestamp(segment.start);
            }
            
            // Start new section
            timeline.push({
                start: timestamp,
                section: sectionType,
                content: text,
                summary: text.substring(0, 100) + (text.length > 100 ? '...' : '')
            });
            
            currentSection = sectionType;
            sectionStart = segment.start;
        } else {
            // Add to current section
            const lastSection = timeline[timeline.length - 1];
            if (lastSection) {
                lastSection.content += ' ' + text;
                lastSection.summary = lastSection.content.substring(0, 100) + 
                    (lastSection.content.length > 100 ? '...' : '');
            }
        }
    });

    return timeline;
}

/**
 * Detect section type based on content
 */
function detectSectionType(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('introduce') || lowerText.includes('background') || 
        lowerText.includes('tell me about yourself') || lowerText.includes('experience')) {
        return 'introduction';
    } else if (lowerText.includes('problem') || lowerText.includes('challenge') || 
               lowerText.includes('difficult') || lowerText.includes('issue')) {
        return 'problem_discussion';
    } else if (lowerText.includes('solution') || lowerText.includes('approach') || 
               lowerText.includes('solve') || lowerText.includes('implement')) {
        return 'solution_discussion';
    } else if (lowerText.includes('design') || lowerText.includes('architecture') || 
               lowerText.includes('system') || lowerText.includes('build')) {
        return 'technical_design';
    } else if (lowerText.includes('question') || lowerText.includes('ask') || 
               lowerText.includes('clarification')) {
        return 'questions';
    } else {
        return 'discussion';
    }
}

/**
 * Format timestamp from seconds to MM:SS format
 */
function formatTimestamp(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Extract entities (names, companies, technologies) from transcript
 */
function extractEntities(text) {
    if (!text) return { names: [], companies: [], technologies: [], locations: [] };

    // Common technology terms (escaped special regex characters)
    const techTerms = [
        'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'express',
        'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'azure', 'gcp', 'docker',
        'kubernetes', 'git', 'github', 'gitlab', 'jenkins', 'ci/cd', 'api', 'rest',
        'graphql', 'microservices', 'html', 'css', 'typescript', 'sass', 'webpack',
        'babel', 'npm', 'yarn', 'sql', 'nosql', 'linux', 'unix', 'windows', 'mac',
        'agile', 'scrum', 'kanban', 'devops', 'machine learning', 'ai', 'tensorflow',
        'pytorch', 'spring', 'django', 'flask', 'laravel', 'rails', 'php', 'cplusplus',
        'csharp', 'dotnet', 'go', 'rust', 'swift', 'kotlin', 'flutter', 'xamarin'
    ];

    // Common company patterns
    const companyPatterns = [
        /\b(Google|Microsoft|Amazon|Apple|Facebook|Meta|Netflix|Tesla|Uber|Airbnb)\b/gi,
        /\b(IBM|Oracle|Salesforce|Adobe|Intel|NVIDIA|AMD|Cisco|VMware)\b/gi,
        /\b(Spotify|Twitter|LinkedIn|GitHub|Slack|Zoom|Dropbox|PayPal|Square)\b/gi,
        /\b([A-Z][a-z]+ (?:Inc|Corp|LLC|Ltd|Company|Systems|Technologies|Solutions))\b/g
    ];

    // Name patterns (basic - proper nouns that could be names)
    const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;

    const technologies = [];
    const companies = [];
    const names = [];

    // Extract technologies with proper escaping
    techTerms.forEach(term => {
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex chars
        const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
        if (regex.test(text)) {
            technologies.push(term.charAt(0).toUpperCase() + term.slice(1));
        }
    });
    
    // Add special cases that need manual handling
    if (/\bc\+\+\b/gi.test(text)) technologies.push('C++');
    if (/\bc#\b/gi.test(text)) technologies.push('C#');
    if (/\.net\b/gi.test(text)) technologies.push('.NET');

    // Extract companies
    companyPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            companies.push(...matches.map(match => match.trim()));
        }
    });

    // Extract potential names
    const nameMatches = text.match(namePattern);
    if (nameMatches) {
        names.push(...nameMatches.filter(name => 
            !technologies.includes(name) && 
            !companies.includes(name)
        ));
    }

    return {
        names: [...new Set(names)].slice(0, 10),
        companies: [...new Set(companies)].slice(0, 10),
        technologies: [...new Set(technologies)].slice(0, 15),
        locations: [] // Could add location extraction later
    };
}

/**
 * Alternative API call using direct HTTP request (sometimes more reliable)
 */
async function tryDirectAPICall(audioBuffer, filename, apiKey) {
    try {
        console.log('🌐 Direct HTTP API call to OpenAI...');
        
        const formData = new FormData();
        formData.append('file', audioBuffer, {
            filename: filename,
            contentType: filename.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg'
        });
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');
        formData.append('response_format', 'verbose_json');
        formData.append('timestamp_granularities[]', 'segment');
        formData.append('timestamp_granularities[]', 'word');
        
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                ...formData.getHeaders()
            },
            body: formData,
            timeout: 30000
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Direct API call failed:', response.status, errorText);
            return null;
        }
        
        const result = await response.json();
        console.log('✅ Direct API call successful');
        return result;
        
    } catch (error) {
        console.log('❌ Direct API call error:', error.message);
        return null;
    }
}

/**
 * Mock transcription for demo/testing
 */
function getMockTranscription() {
    // Return empty transcript so user can type their own, or use Load Demo button
    const mockText = '';
    
    console.log('📝 Using mock transcription (empty for manual input)');
    
    const segments = [];

    return {
        success: true,
        transcription: {
            text: mockText,
            segments: segments,
            language: 'en',
            duration: 0
        },
        metadata: {
            model: 'mock-whisper',
            timestamp: new Date().toISOString(),
            filename: 'mock-audio.mp3',
            demo_mode: true
        }
    };
}

/**
 * Validate audio file
 */
export function validateAudioFile(file) {
    const allowedTypes = [
        'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 
        'audio/webm', 'audio/m4a', 'audio/x-m4a', 'audio/mp4a-latm', 'audio/aac', 'audio/ogg'
    ];
    
    const maxSize = 25 * 1024 * 1024; // 25MB
    
    if (!file) {
        throw new Error('No audio file provided');
    }
    
    if (file.size > maxSize) {
        throw new Error(`File too large. Maximum size is 25MB, got ${Math.round(file.size / 1024 / 1024)}MB`);
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error(`Unsupported file type: ${file.mimetype}`);
    }
    
    return true;
}