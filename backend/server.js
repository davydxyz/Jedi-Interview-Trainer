import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { transcribeAudio, validateAudioFile } from './services/whisper.js';
import { analyzeTranscript, testDeepSeekConnection } from './services/ai-service.js';
import { generateFollowupSuggestions } from './services/followup-service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.resolve(__dirname, '../'))); // Serve frontend files

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/m4a',
            'audio/x-m4a', 'audio/mp4a-latm', 'audio/aac'  // Additional M4A MIME types
        ];
        
        console.log('🔍 File MIME type detection:', {
            filename: file.originalname,
            mimetype: file.mimetype,
            allowed: allowedTypes.includes(file.mimetype)
        });
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.error(`❌ Unsupported MIME type: ${file.mimetype}. Allowed types:`, allowedTypes);
            cb(new Error(`Invalid audio format: ${file.mimetype}. Supported: MP3, WAV, M4A, MP4`), false);
        }
    }
});

// API Endpoints

/**
 * Transcribe audio file to text
 */
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    try {
        console.log('🎤 Transcription request received');
        
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // Log file details for debugging
        console.log('📁 File details:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            buffer_length: req.file.buffer.length
        });

        // Validate audio file
        try {
            validateAudioFile(req.file);
        } catch (validationError) {
            console.error('❌ File validation failed:', validationError.message);
            return res.status(400).json({ error: validationError.message });
        }

        const result = await transcribeAudio(req.file.buffer, req.file.originalname);
        
        // Extract transcript text and enhanced data for frontend
        const transcript = result.success ? result.transcription.text : '';
        
        const responseData = {
            success: result.success,
            transcript: transcript,
            timeline: result.success ? result.transcription.timeline : [],
            entities: result.success ? result.transcription.entities : {},
            segments: result.success ? result.transcription.segments : [],
            words: result.success ? result.transcription.words : [],
            metadata: result.metadata
        };
        
        console.log('📤 Sending to frontend - Timeline length:', responseData.timeline.length);
        console.log('📤 Entities:', JSON.stringify(responseData.entities, null, 2));
        
        res.json(responseData);

    } catch (error) {
        console.error('❌ Transcription failed:', error);
        res.status(500).json({
            error: 'Transcription failed',
            details: error.message
        });
    }
});

/**
 * Analyze interview transcript with AI
 */
app.post('/api/analyze', async (req, res) => {
    try {
        console.log('🧠 Analysis request received');
        
        const { transcript, mentor, interviewType } = req.body;
        
        if (!transcript) {
            return res.status(400).json({ error: 'No transcript provided' });
        }

        console.log(`📋 Mentor: ${mentor}, Interview Type: ${interviewType}`);
        const result = await analyzeTranscript(transcript, mentor, interviewType);
        res.json(result);

    } catch (error) {
        console.error('❌ Analysis failed:', error);
        res.status(500).json({
            error: 'Analysis failed',
            details: error.message
        });
    }
});

/**
 * Generate intelligent follow-up suggestions
 */
app.post('/api/followup', async (req, res) => {
    try {
        console.log('💡 Follow-up suggestions request received');
        
        const { 
            originalTranscript, 
            mentorResponse, 
            mentor, 
            interviewType,
            conversationHistory 
        } = req.body;
        
        if (!originalTranscript || !mentorResponse) {
            return res.status(400).json({ 
                error: 'Missing required fields: originalTranscript and mentorResponse' 
            });
        }

        console.log(`🎯 Generating follow-ups for ${mentor} - ${interviewType}`);
        
        const conversationContext = {
            originalTranscript,
            mentorResponse,
            mentor: mentor || 'yoda',
            interviewType: interviewType || 'behavioral',
            conversationHistory: conversationHistory || []
        };
        
        const result = await generateFollowupSuggestions(conversationContext);
        
        console.log(`✅ Generated ${result.suggestions?.length || 0} follow-up suggestions`);
        res.json(result);

    } catch (error) {
        console.error('❌ Follow-up generation failed:', error);
        res.status(500).json({
            error: 'Follow-up generation failed',
            details: error.message
        });
    }
});

/**
 * Complete pipeline: transcribe + analyze
 */
app.post('/api/complete', upload.single('audio'), async (req, res) => {
    try {
        console.log('🎯 Complete processing request received');
        
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // Step 1: Transcribe
        console.log('Step 1: Transcribing audio...');
        const transcriptionResult = await transcribeAudio(req.file.buffer, req.file.originalname);
        
        if (!transcriptionResult.success) {
            return res.status(500).json(transcriptionResult);
        }

        // Step 2: Analyze
        console.log('Step 2: Analyzing transcript...');
        const analysisResult = await analyzeTranscript(transcriptionResult.transcription.text);
        
        res.json({
            success: true,
            transcription: transcriptionResult.transcription,
            analysis: analysisResult.analysis,
            metadata: {
                transcription: transcriptionResult.metadata,
                analysis: analysisResult.metadata
            }
        });

    } catch (error) {
        console.error('❌ Complete processing failed:', error);
        res.status(500).json({
            error: 'Processing failed',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Interview Helper',
        apis: {
            openrouter_configured: !!process.env.OPENROUTER_API_KEY,
            openai_configured: !!process.env.OPENAI_API_KEY
        },
        endpoints: [
            'POST /api/transcribe',
            'POST /api/analyze', 
            'POST /api/followup',
            'POST /api/complete',
            'GET /api/test-deepseek'
        ]
    });
});

/**
 * Test DeepSeek API connection
 */
app.get('/api/test-deepseek', async (req, res) => {
    try {
        console.log('🧪 Testing DeepSeek API connection...');
        const testResult = await testDeepSeekConnection();
        
        res.json({
            success: testResult.success,
            timestamp: new Date().toISOString(),
            ...testResult
        });
    } catch (error) {
        console.error('❌ DeepSeek test failed:', error);
        res.status(500).json({
            success: false,
            error: 'DeepSeek test failed',
            details: error.message
        });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /',
            'GET /health',
            'POST /api/transcribe',
            'POST /api/analyze',
            'POST /api/complete'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 Interview Helper - Complete Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port: ${PORT}
🌍 Frontend: http://localhost:${PORT}
🔗 Health: http://localhost:${PORT}/health
🎤 Transcribe: POST /api/transcribe
🧠 Analyze: POST /api/analyze  
🎯 Complete: POST /api/complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APIs:
🔑 OpenRouter: ${!!process.env.OPENROUTER_API_KEY ? '✅' : '❌'} 
🔑 OpenAI: ${!!process.env.OPENAI_API_KEY ? '✅' : '❌'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});