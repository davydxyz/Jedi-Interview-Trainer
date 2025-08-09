/**
 * Main AI Analysis Service - Orchestrates the entire analysis process
 */

import { getMentorPersonality, getInterviewTypeContext } from './mentor-personalities.js';
import { parseAndValidateResponse, createFallbackAnalysis } from './response-parser.js';

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
        return getDemoAnalysis(transcript, mentor, interviewType);
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
                return getDemoAnalysis(transcript, mentor, interviewType);
            }
            
            // Wait before retry
            await sleep(RETRY_DELAY * attempt);
        }
    }
}

/**
 * Perform the actual API analysis
 */
async function performAnalysis(transcript, attemptNumber, mentor, interviewType) {
    const analysisPrompt = createEnhancedPrompt(transcript, mentor, interviewType);
    
    console.log(`🔄 API attempt ${attemptNumber}...`);
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'Interview Helper - Professional Analysis'
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                {
                    role: 'system',
                    content: getSystemPrompt()
                },
                {
                    role: 'user',
                    content: analysisPrompt
                }
            ],
            temperature: 0.2,  // Lower for more consistent results
            max_tokens: 4000,
            top_p: 0.9,
            frequency_penalty: 0.1
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
        throw new Error('No analysis content received from DeepSeek');
    }

    const analysis = parseAndValidateResponse(analysisText, transcript);
    
    return {
        success: true,
        analysis: analysis,
        metadata: {
            model: MODEL,
            timestamp: new Date().toISOString(),
            transcript_length: transcript.length,
            attempt_number: attemptNumber,
            token_usage: data.usage || null
        }
    };
}

/**
 * Enhanced system prompt for interview analysis
 */
function getSystemPrompt() {
    return `You are an expert technical interview analyst with 10+ years of experience evaluating software engineering candidates. 

Your expertise includes:
- Technical skill assessment
- Communication evaluation  
- Problem-solving analysis
- Cultural fit indicators
- Behavioral pattern recognition

You provide structured, actionable feedback that helps both interviewers make decisions and candidates improve.

CRITICAL: You must ALWAYS respond with valid JSON only. No explanatory text before or after the JSON.`;
}

/**
 * Create enhanced analysis prompt with mentor personality and interview type
 */
function createEnhancedPrompt(transcript, mentor, interviewType) {
    const wordCount = transcript.split(/\s+/).length;
    const estimatedDuration = Math.round(wordCount / 150); // ~150 words per minute
    
    const mentorContext = getMentorPersonality(mentor);
    const interviewTypeContext = getInterviewTypeContext(interviewType);
    
    return `Analyze this ${estimatedDuration}-minute interview transcript and return ONLY valid JSON with this exact structure:

{
  "highlights": [
    {
      "text": "specific quote or achievement demonstrating strength",
      "category": "technical_skill|problem_solving|communication|leadership|learning_ability",
      "confidence": 0.85,
      "reasoning": "why this demonstrates the candidate's strength"
    }
  ],
  "improvements": [
    {
      "text": "specific area needing development",
      "suggestion": "actionable improvement advice",
      "priority": "high|medium|low",
      "category": "technical|communication|behavioral"
    }
  ],
  "technical_assessment": {
    "level": "junior|mid|senior|staff|principal",
    "skills_demonstrated": ["specific technical skills shown"],
    "knowledge_gaps": ["areas where knowledge seems limited"],
    "problem_solving_approach": "assessment of their methodology"
  },
  "communication_analysis": {
    "clarity": "poor|fair|good|excellent",
    "structure": "how well they organize thoughts",
    "listening": "how well they understood questions",
    "questioning": "quality of questions they asked"
  },
  "entities": {
    "technologies": ["specific tech mentioned"],
    "companies": ["organizations discussed"],
    "projects": ["notable projects mentioned"],
    "methodologies": ["processes/frameworks mentioned"]
  },
  "interview_flow": [
    {
      "section": "introduction|background|technical_questions|system_design|behavioral|candidate_questions|wrap_up",
      "summary": "what was covered in this section",
      "key_moments": ["notable responses or insights"],
      "duration_estimate": "estimated minutes for this section"
    }
  ],
  "overall_recommendation": {
    "decision": "strong_hire|hire|maybe|no_hire",
    "confidence": 8,
    "key_strengths": ["top 3 candidate strengths"],
    "main_concerns": ["primary areas of concern"],
    "cultural_fit": "assessment of team/company alignment",
    "next_steps": "recommended follow-up actions"
  },
  "interview_quality": {
    "questions_effectiveness": "how well the interview was conducted",
    "areas_not_explored": ["topics that could have been covered better"],
    "suggested_follow_ups": ["questions for next rounds"]
  }
}

Analysis Guidelines:
1. Be specific and evidence-based - quote actual responses
2. Balance positive and constructive feedback
3. Consider both technical and soft skills
4. Assess communication clarity and thought process
5. Note any red flags or exceptional strengths
6. Provide actionable next steps

MENTOR CONTEXT: ${mentorContext}
INTERVIEW TYPE FOCUS: ${interviewTypeContext}

Interview Transcript:
${transcript}

Return ONLY the JSON object:`;
}

/**
 * Demo analysis for fallback with mentor personality
 */
function getDemoAnalysis(transcript, mentor, interviewType) {
    const hasTech = /javascript|react|node|python|java|system|design|database|api/gi.test(transcript);
    const hasCompanies = /google|microsoft|amazon|apple|meta|netflix|uber/gi.test(transcript);
    const wordCount = transcript.split(/\s+/).length;
    const isLongInterview = wordCount > 800;
    
    return {
        success: true,
        analysis: {
            highlights: [
                {
                    text: "Demonstrated clear communication throughout the interview",
                    category: "communication",
                    confidence: 0.85,
                    reasoning: "Responses were well-structured and easy to follow"
                },
                {
                    text: hasTech ? "Strong technical knowledge in modern web development" : "Good fundamental technical understanding",
                    category: "technical_skill",
                    confidence: hasTech ? 0.9 : 0.7,
                    reasoning: "Showed familiarity with relevant technologies and concepts"
                },
                {
                    text: "Proactive about asking clarifying questions",
                    category: "problem_solving",
                    confidence: 0.8,
                    reasoning: "Good practice for understanding requirements before solving"
                }
            ],
            improvements: [
                {
                    text: "Could provide more specific examples with quantified impact",
                    suggestion: "When describing achievements, include metrics like performance improvements or user impact",
                    priority: "medium",
                    category: "communication"
                },
                {
                    text: "Opportunity to discuss system design considerations",
                    suggestion: "Elaborate on scalability, reliability, and trade-offs in technical solutions",
                    priority: "medium", 
                    category: "technical"
                }
            ],
            technical_assessment: {
                level: hasTech ? (isLongInterview ? "senior" : "mid") : "junior",
                skills_demonstrated: hasTech ? 
                    ["JavaScript", "React", "Node.js", "System Design", "Problem Solving"] : 
                    ["Programming Fundamentals", "Logical Thinking"],
                knowledge_gaps: isLongInterview ? [] : ["Advanced system architecture", "Performance optimization"],
                problem_solving_approach: "Systematic approach with good questioning technique"
            },
            communication_analysis: {
                clarity: "good",
                structure: "Well-organized responses with clear examples",
                listening: "Good comprehension and appropriate follow-up questions",
                questioning: "Asked relevant questions about requirements and constraints"
            },
            entities: {
                technologies: hasTech ? ["JavaScript", "React", "Node.js", "Database", "API"] : ["Programming"],
                companies: hasCompanies ? ["Google", "Microsoft", "Amazon"] : ["Tech Company"],
                projects: ["Web Application", "System Design"],
                methodologies: ["Agile", "Problem-Solving Process"]
            },
            interview_flow: [
                {
                    section: "introduction",
                    summary: "Background and experience discussion",
                    key_moments: ["Professional background", "Key experiences"],
                    duration_estimate: "8-10 minutes"
                },
                {
                    section: "technical_questions",
                    summary: "Technical problem-solving and system design",
                    key_moments: ["Approach explanation", "Technology choices", "Trade-off considerations"],
                    duration_estimate: "15-20 minutes"
                },
                {
                    section: "candidate_questions",
                    summary: "Questions about role and team",
                    key_moments: ["Interest in team dynamics", "Growth opportunities"],
                    duration_estimate: "5-8 minutes"
                }
            ],
            overall_recommendation: {
                decision: hasTech ? "hire" : "maybe",
                confidence: hasTech ? 8 : 6,
                key_strengths: [
                    "Clear communication skills",
                    hasTech ? "Strong technical foundation" : "Good learning potential",
                    "Collaborative approach"
                ],
                main_concerns: isLongInterview ? [] : ["Limited experience with complex systems"],
                cultural_fit: "Positive indicators for team collaboration and growth mindset",
                next_steps: hasTech ? "Technical deep-dive or system design round" : "Pair programming or technical assessment"
            },
            interview_quality: {
                questions_effectiveness: "Good coverage of technical and behavioral aspects",
                areas_not_explored: isLongInterview ? [] : ["Leadership experience", "Conflict resolution"],
                suggested_follow_ups: ["System design deep-dive", "Code review exercise", "Team collaboration scenarios"]
            }
        },
        metadata: {
            model: "Demo Mode - Enhanced Analysis",
            timestamp: new Date().toISOString(),
            transcript_length: transcript.length,
            demo_mode: true,
            analysis_type: "fallback"
        }
    };
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

/**
 * Utility function for delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}