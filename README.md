# Interview Helper

**Star Wars Jedi Interview Training Platform** - AI-powered interview coaching with voice-to-text transcription, intelligent analysis, and tailored follow-up suggestions.

## Architecture Overview

The platform leverages AI technology to provide personalized interview coaching through a full-stack web application with AI-powered analysis systems and an immersive Star Wars-themed interface.

### Modular File Structure

```
Interview-helper/
├── index.html                    # Main SPA entry point
├── css/                          # Modular CSS architecture
│   ├── base/                     # Foundation styles (reset, typography)
│   ├── components/               # Feature-specific styling
│   ├── themes/                   # Star Wars visual theming
│   └── components.css            # Core layout systems
├── js/                           # Modular JavaScript architecture
│   ├── core/                     # Application orchestration
│   │   ├── app.js               # Main controller & module loader
│   │   ├── state-manager.js     # Centralized state management
│   │   └── ui-manager.js        # Page navigation & DOM manipulation
│   ├── services/                # External API integrations
│   │   ├── api-service.js       # RESTful backend communication
│   │   ├── audio-manager.js     # Voice recording & processing
│   │   └── followup-manager.js  # AI follow-up generation
│   ├── components/              # UI component modules
│   │   ├── chat-interface.js    # Message display & truncation
│   │   └── mentor-formatter.js  # Response styling & parsing
│   └── data/                    # Configuration & content
│       └── mentor-config.js     # Mentor personalities & demo data
└── backend/                     # Node.js Express API
    ├── server.js                # RESTful API server
    ├── package.json             # NPM dependencies
    ├── .env.example             # Environment template
    └── services/                # Microservice modules
        ├── deepseek-enhanced.js     # Primary AI analysis
        ├── followup-service.js      # Context-aware question generation
        ├── whisper.js               # Audio transcription
        ├── validators/              # Response validation modules
        └── demo-data/               # Fallback content generators
```

## Quick Start

### 1. Frontend Development (Demo Mode)
```bash
cd Interview-helper
python3 -m http.server 8001
```
Open: http://127.0.0.1:8001

### 2. Backend Server (Terminal 1)
```bash
cd Interview-helper/backend
cp .env.example .env
# Edit .env with your API keys:
# OPENROUTER_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here

npm install
npm start

```bash
cd /Users/mac/Desktop/Jedi-Interview-Trainer/backend && npm start
```
Backend running on: http://localhost:3001

### 3. Frontend Server (Terminal 2)
```bash
cd Interview-helper
python3 -m http.server 8001 --bind 127.0.0.1
```
Frontend: http://127.0.0.1:8001

**API Keys (Free):**
- OpenRouter: https://openrouter.ai/keys
- OpenAI: https://platform.openai.com/api-keys

## Features & AI Capabilities

### 🎭 **Mentor Personalities**
- **Master Yoda** - Wisdom-focused behavioral coaching
- **Darth Vader** - Direct technical/leadership analysis  
- **Obi-Wan Kenobi** - Strategic consulting guidance

### 🤖 **RESTful API Architecture**
- **Primary Analysis** (`POST /api/analyze`) - Mentor-specific feedback via DeepSeek-V3
- **Follow-up Generation** (`POST /api/followup`) - Context-aware strategic questions
- **Audio Transcription** (`POST /api/transcribe`) - Voice-to-text via Whisper API
- **Health Check** (`GET /health`) - Server status monitoring

### 💡 **Intelligent Features**
- **Voice Recording** - Browser-based audio capture with auto-transcription
- **Smart Suggestions** - AI-generated follow-up questions categorized by SPECIFICITY, DEPTH, IMPLEMENTATION
- **Conversation Context** - Persistent state management across multiple AI interactions
- **Progressive Enhancement** - Graceful fallbacks with demo content when APIs unavailable

## Technical Architecture

### **RESTful API Flow**
The platform implements a stateless RESTful architecture where each HTTP request contains complete information needed for processing. Resources are identified by clean URLs (`/api/analyze`, `/api/followup`), with HTTP methods (POST, GET) defining operations. This design enables horizontal scaling, simplifies client-server communication, and maintains separation of concerns between frontend state management and backend processing.

### **Frontend Stack**
- **Language**: Vanilla JavaScript (ES6+) with modular class-based architecture
- **Styling**: Component-based CSS3 with advanced animations and responsive design
- **State Management**: Centralized StateManager pattern for application-wide data flow
- **Audio Processing**: Web Audio API integration with MediaRecorder for voice capture
- **UI Framework**: Custom-built responsive design with CSS Grid and Flexbox

### **Backend Infrastructure**
- **Runtime**: Node.js with Express.js RESTful API framework
- **API Architecture**: Microservices with dedicated endpoints following REST principles
- **AI Integration**: OpenRouter proxy for seamless DeepSeek-V3 API communication
- **Audio Processing**: OpenAI Whisper API for speech-to-text transcription
- **Error Handling**: Comprehensive validation with graceful fallback systems

### **AI Integration Pattern**
```
User Input → /api/analyze → DeepSeek-V3 → Mentor-Specific Feedback
     ↓
Conversation Context → /api/followup → DeepSeek-V3 → Strategic Questions
     ↓
Voice Recording → /api/transcribe → OpenAI Whisper → Text Conversion
```

### **Production-Ready Features**
- **Scalability**: RESTful API design for horizontal scaling
- **Security**: Environment-based API key management with input validation
- **Performance**: Modular loading with intelligent cache management
- **Developer Experience**: Comprehensive logging and hot-reload development environment

---

**Tech Stack**: Vanilla JS • Node.js • Express • DeepSeek-V3 • OpenAI Whisper • RESTful APIs • CSS3 • Web Audio API