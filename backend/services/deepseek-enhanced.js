/**
 * Enhanced DeepSeek AI Analysis Service
 * Production-ready implementation with robust error handling and optimized prompts
 * Refactored to use modular validation and demo data
 */

const ResponseValidator = require('./validators/response-validator');
const DemoAnalysisGenerator = require('./demo-data/demo-analysis');

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'deepseek/deepseek-r1-distill-llama-70b:free';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Main analysis function with enhanced error handling and mentor personalities
 */
export async function analyzeTranscript(transcript, mentor = null, interviewType = null) {
    console.log(`🧠 Starting enhanced DeepSeek analysis... (Mentor: ${mentor}, Type: ${interviewType})`);
    
    // Validate input
    if (!transcript || transcript.trim().length < 50) {
        throw new Error('Transcript too short or empty for meaningful analysis');
    }

    // Check API key configuration
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
        console.log('⚠️  OpenRouter API key not configured, using demo analysis');
        return DemoAnalysisGenerator.generateDemoAnalysis(transcript, mentor, interviewType);
    }

    // Attempt analysis with retry logic
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await performAnalysis(transcript, attempt, mentor, interviewType);
            console.log('✅ DeepSeek analysis completed successfully');
            return result;
        } catch (error) {
            console.error(`❌ Analysis attempt ${attempt} failed:`, error.message);
            
            if (attempt === MAX_RETRIES) {
                console.log('🔄 All attempts failed, falling back to demo analysis');
                return DemoAnalysisGenerator.generateDemoAnalysis(transcript, mentor, interviewType);
            }
            
            // Wait before retry
            await sleep(RETRY_DELAY * attempt);
        }
    }
}

/**
 * Perform the actual API analysis
 */
async function performAnalysis(transcript, attempt, mentor, interviewType) {
    console.log(`🔄 Analysis attempt ${attempt}/${MAX_RETRIES}`);
    
    const startTime = Date.now();
    const prompt = buildPrompt(transcript, mentor, interviewType);
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://interview-helper.local',
            'X-Title': 'Jedi Interview Training'
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                {
                    role: 'system', 
                    content: 'You are an expert interview analyst. Return ONLY valid JSON with no extra text, markdown, or explanations.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 4000,
            temperature: 0.3,
            top_p: 0.8,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenRouter API');
    }

    const analysisText = data.choices[0].message.content.trim();
    
    if (!analysisText) {
        throw new Error('Empty response content from OpenRouter API');
    }

    const analysis = ResponseValidator.parseAndValidateResponse(analysisText, transcript);
    
    return {
        success: true,
        analysis,
        metadata: {
            model: MODEL,
            timestamp: new Date().toISOString(),
            processing_time_ms: Date.now() - startTime,
            attempt_number: attempt,
            transcript_length: transcript.length,
            tokens_used: data.usage?.total_tokens || 'unknown'
        }
    };
}

/**
 * Build the analysis prompt with mentor personality and interview type context
 */
function buildPrompt(transcript, mentor, interviewType) {
    const wordCount = transcript.split(/\s+/).length;
    const estimatedDuration = Math.round(wordCount / 150); // ~150 words per minute
    
    const mentorContext = DemoAnalysisGenerator.getMentorContext(mentor);
    const interviewTypeContext = DemoAnalysisGenerator.getInterviewTypeContext(interviewType);
    
    return `Analyze this ${estimatedDuration}-minute interview transcript and return ONLY valid JSON with this exact structure:

{
  "highlights": [
    {
      "text": "specific strength observed",
      "category": "communication|technical_skill|problem_solving|leadership",
      "confidence": 0.0-1.0,
      "reasoning": "brief explanation of why this is a strength"
    }
  ],
  "improvements": [
    {
      "text": "specific area for improvement",
      "suggestion": "actionable advice for improvement", 
      "priority": "high|medium|low",
      "category": "communication|technical|leadership|general"
    }
  ],
  "technical_assessment": {
    "level": "junior|mid|senior|staff|principal",
    "skills_demonstrated": ["skill1", "skill2"],
    "knowledge_gaps": ["gap1", "gap2"],
    "problem_solving_approach": "description of their approach"
  },
  "communication_analysis": {
    "clarity": "poor|fair|good|excellent",
    "structure": "assessment of response organization",
    "listening": "assessment of comprehension",
    "questioning": "assessment of questions asked"
  },
  "entities": {
    "technologies": ["tech1", "tech2"],
    "companies": ["company1"],
    "projects": ["project1"],
    "methodologies": ["method1"]
  },
  "interview_flow": [
    {
      "section": "section_name",
      "summary": "what was covered",
      "key_moments": ["moment1", "moment2"],
      "duration_estimate": "X minutes"
    }
  ],
  "overall_recommendation": {
    "decision": "strong_hire|hire|maybe|no_hire",
    "confidence": 1-10,
    "key_strengths": ["strength1", "strength2"],
    "main_concerns": ["concern1"],
    "cultural_fit": "assessment",
    "next_steps": "recommended next interview steps"
  },
  "interview_quality": {
    "questions_effectiveness": "assessment of interviewer questions",
    "areas_not_explored": ["area1"],
    "suggested_follow_ups": ["suggestion1"]
  }
}

Mentor Context: ${mentorContext}
Interview Type Focus: ${interviewTypeContext}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no explanations, no extra text.

Transcript:
${transcript}`;
}

/**
 * Utility function for delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test API connectivity
 */
export async function testDeepSeekConnection() {
    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: 'user', content: 'Test connection. Respond with: {"status": "connected"}' }],
                max_tokens: 50
            })
        });

        return {
            success: response.ok,
            status: response.status,
            model: MODEL,
            response: response.ok ? await response.json() : await response.text()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
} 