# Interview Helper - Implementation Plan

## Data Flow Architecture

```
Audio File → Transcription → AI Analysis → Structured Display
    ↓              ↓              ↓              ↓
[File Upload] → [Whisper API] → [DeepSeek] → [Frontend]
```

## Core Data Structures

### 1. Audio Upload Object
```javascript
{
  file: File,              // Raw audio file
  filename: string,        // Original filename
  size: number,           // File size in bytes
  duration: number,       // Audio duration (if available)
  mimeType: string        // Audio format
}
```

### 2. Transcription Response
```javascript
{
  success: boolean,
  transcription: {
    text: string,           // Full transcript
    segments: [{            // Timestamped segments
      start: number,        // Start time in seconds
      end: number,          // End time in seconds
      text: string          // Segment text
    }],
    language: string,       // Detected language
    duration: number        // Total duration
  },
  metadata: {
    model: "whisper-1",
    timestamp: string,
    processingTime: number
  }
}
```

### 3. AI Analysis Response
```javascript
{
  success: boolean,
  analysis: {
    highlights: [{
      text: string,         // Quote or description
      category: string,     // technical_skill|communication|etc
      confidence: number,   // 0-1 confidence score
      timestamp: string     // When mentioned (optional)
    }],
    improvements: [{
      text: string,         // Area needing work
      suggestion: string,   // Specific advice
      priority: string,     // high|medium|low
      category: string
    }],
    entities: {
      names: string[],      // People mentioned
      companies: string[],  // Organizations
      technologies: string[], // Tech stack
      roles: string[]       // Job positions
    },
    timeline: [{
      timestamp: string,    // Time or section
      section: string,      // interview phase
      content: string,      // What happened
      keyPoints: string[]   // Main topics
    }],
    overall: {
      recommendation: string,     // hire|maybe|no_hire
      technicalLevel: string,     // junior|mid|senior
      communicationSkills: string, // poor|fair|good|excellent
      culturalFit: string,        // Assessment
      confidence: number,         // Overall confidence 1-10
      summary: string            // 2-3 sentence overview
    }
  }
}
```

## File Implementation Requirements

### Frontend Files

#### js/app.js
```javascript
#AudioRecording - MediaRecorder integration
#FileUpload - Drag & drop + file picker
#TranscriptionAPI - Call backend transcription endpoint
#AnalysisAPI - Call backend analysis endpoint  
#StatusTracking - Progress indicators
#ResultsDisplay - Structured data presentation
#ErrorHandling - User-friendly error messages
```

#### js/audio.js (NEW)
```javascript
#MediaRecorder - Browser audio recording
#AudioValidation - Format and size checks
#AudioPreview - Playback before upload
#CompressionHandler - Optimize file size
```

#### css/components.css (NEW)
```css
#AudioRecorder - Recording UI components
#FileUpload - Upload area styling
#ProgressBars - Status indicators
#ResultCards - Analysis display cards
#ResponsiveDesign - Mobile optimization
```

### Backend Files

#### server.js
```javascript
#ExpressServer - Main server setup
#CORSConfiguration - Cross-origin requests
#StaticFileServing - Frontend delivery
#ErrorMiddleware - Global error handling
#APIRouteSetup - Route organization
```

#### routes/transcription.js (NEW)
```javascript
#FileUploadHandling - Multer configuration
#AudioValidation - Format/size validation
#WhisperAPIIntegration - OpenAI Whisper calls
#ResponseFormatting - Consistent API responses
#ErrorHandling - Transcription-specific errors
```

#### routes/analysis.js (NEW)
```javascript
#TranscriptValidation - Input validation
#DeepSeekAPIIntegration - AI analysis calls
#PromptEngineering - Optimized prompts
#ResponseParsing - JSON structure validation
#FallbackHandling - Demo mode when API fails
```

#### services/whisper.js (NEW)
```javascript
#OpenAIClient - Whisper API client
#AudioPreprocessing - Format conversion
#TimestampExtraction - Segment parsing
#LanguageDetection - Auto language detection
#RetryLogic - Handle API failures
```

#### services/deepseek.js (NEW)
```javascript
#OpenRouterClient - DeepSeek API client
#PromptTemplates - Structured analysis prompts
#ResponseValidation - JSON parsing & validation
#CacheSystem - Response caching
#TokenOptimization - Cost-effective API usage
```

#### utils/validation.js (NEW)
```javascript
#AudioFileValidator - File format validation
#TranscriptValidator - Text input validation
#APIResponseValidator - Response structure validation
#SanitizeInputs - Security sanitization
```

#### config/api.js (NEW)
```javascript
#APIConfiguration - Endpoints and keys
#ModelSelection - AI model preferences
#RateLimiting - API usage limits
#RetryStrategies - Failure recovery
```

### Configuration Files

#### backend/.env
```bash
#OpenAIConfiguration - OPENAI_API_KEY
#OpenRouterConfiguration - OPENROUTER_API_KEY  
#ServerConfiguration - PORT, NODE_ENV
#SecurityConfiguration - CORS origins
#FileConfiguration - Upload limits, allowed formats
```

#### backend/package.json
```json
#Dependencies - express, cors, dotenv, multer, openai
#Scripts - start, dev, test
#EngineRequirements - Node.js version
```

## API Endpoints Design

### POST /api/transcribe
- **Input**: Audio file (FormData)
- **Output**: Transcription object
- **Processing**: Whisper API → Format response

### POST /api/analyze  
- **Input**: Transcript text (JSON)
- **Output**: Analysis object
- **Processing**: DeepSeek API → Parse response

### POST /api/complete
- **Input**: Audio file (FormData) 
- **Output**: Combined transcription + analysis
- **Processing**: Whisper → DeepSeek → Combined response

### GET /api/health
- **Output**: System status + API availability

## Implementation Phases

### Phase 1: Core APIs ✅
- [x] Basic server setup
- [x] Simple analysis endpoint
- [x] Frontend integration

### Phase 2: Transcription Integration 
- [ ] OpenAI Whisper setup
- [ ] File upload handling
- [ ] Audio validation
- [ ] Transcript formatting

### Phase 3: Enhanced Analysis
- [ ] Better AI prompts
- [ ] Structured parsing
- [ ] Error handling
- [ ] Response validation

### Phase 4: Frontend Enhancement
- [ ] Audio recording
- [ ] File upload UI
- [ ] Progress indicators
- [ ] Better error display

### Phase 5: Production Ready
- [ ] Caching system
- [ ] Rate limiting
- [ ] Security hardening
- [ ] Performance optimization