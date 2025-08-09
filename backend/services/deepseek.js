/**
 * DeepSeek AI Analysis Service via OpenRouter
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'deepseek/deepseek-r1-distill-llama-70b:free';

/**
 * Analyze transcript using DeepSeek AI
 */
export async function analyzeTranscript(transcript) {
    try {
        console.log('🧠 Starting AI analysis...');
        
        if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_api_key_here') {
            console.log('⚠️ OpenRouter API key not configured, using demo analysis');
            return getDemoAnalysis(transcript);
        }

        const analysisPrompt = createAnalysisPrompt(transcript);
        
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3001',
                'X-Title': 'Interview Helper Analysis'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert interview analyst. Always respond with valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: analysisPrompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 3000
            })
        });

        if (!response.ok) {
            console.log('🔄 API failed, falling back to demo analysis');
            return getDemoAnalysis(transcript);
        }

        const data = await response.json();
        const analysisText = data.choices[0]?.message?.content;

        if (!analysisText) {
            return getDemoAnalysis(transcript);
        }

        const analysis = parseAIResponse(analysisText);
        console.log('✅ AI analysis completed');
        
        return {
            success: true,
            analysis: analysis,
            metadata: {
                model: MODEL,
                timestamp: new Date().toISOString(),
                transcript_length: transcript.length
            }
        };

    } catch (error) {
        console.error('❌ AI Analysis failed:', error);
        console.log('🔄 Falling back to demo analysis');
        return getDemoAnalysis(transcript);
    }
}

/**
 * Create structured analysis prompt
 */
function createAnalysisPrompt(transcript) {
    return `Analyze this interview transcript and return ONLY a JSON object with this structure:

{
  "highlights": [
    {
      "text": "specific quote or achievement",
      "category": "technical_skill|communication|problem_solving|leadership", 
      "confidence": 0.85
    }
  ],
  "improvements": [
    {
      "text": "area needing improvement",
      "suggestion": "specific actionable advice",
      "priority": "high|medium|low"
    }
  ],
  "entities": {
    "names": ["person names mentioned"],
    "companies": ["company names"],
    "technologies": ["technical skills and tools"],
    "roles": ["job positions discussed"]
  },
  "timeline": [
    {
      "section": "introduction|technical|behavioral|questions",
      "content": "what was discussed",
      "keyPoints": ["main topics covered"]
    }
  ],
  "overall": {
    "recommendation": "hire|maybe|no_hire", 
    "technicalLevel": "junior|mid|senior",
    "communicationSkills": "poor|fair|good|excellent",
    "confidence": 8,
    "summary": "2-3 sentence assessment"
  }
}

Interview Transcript:
${transcript}

Return ONLY the JSON object:`;
}

/**
 * Parse AI response and validate structure
 */
function parseAIResponse(responseText) {
    try {
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : responseText;
        
        const parsed = JSON.parse(jsonText);
        
        // Validate and provide defaults
        return {
            highlights: (parsed.highlights || []).slice(0, 8),
            improvements: (parsed.improvements || []).slice(0, 5),
            entities: {
                names: parsed.entities?.names || [],
                companies: parsed.entities?.companies || [],
                technologies: parsed.entities?.technologies || [],
                roles: parsed.entities?.roles || []
            },
            timeline: parsed.timeline || [],
            overall: {
                recommendation: parsed.overall?.recommendation || 'maybe',
                technicalLevel: parsed.overall?.technicalLevel || 'mid',
                communicationSkills: parsed.overall?.communicationSkills || 'good',
                confidence: parsed.overall?.confidence || 7,
                summary: parsed.overall?.summary || 'Analysis completed successfully'
            }
        };
        
    } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return createFallbackAnalysis(responseText);
    }
}

/**
 * Demo analysis for testing/fallback
 */
function getDemoAnalysis(transcript) {
    const wordCount = transcript.split(/\s+/).length;
    const hasTech = /javascript|react|node|python|aws|database/gi.test(transcript);
    const hasCompanies = /google|microsoft|amazon|apple/gi.test(transcript);
    
    return {
        success: true,
        analysis: {
            highlights: [
                {
                    text: "Demonstrated strong technical knowledge with 5 years experience",
                    category: "technical_skill",
                    confidence: 0.9
                },
                {
                    text: "Excellent problem-solving approach to memory leak optimization",
                    category: "problem_solving", 
                    confidence: 0.85
                },
                {
                    text: "Clear communication and structured thinking",
                    category: "communication",
                    confidence: 0.8
                },
                {
                    text: "Proactive about learning and asking good questions",
                    category: "leadership",
                    confidence: 0.75
                }
            ],
            improvements: [
                {
                    text: "Could provide more specific metrics on performance improvements",
                    suggestion: "Quantify achievements with numbers (e.g., '40% memory reduction')",
                    priority: "medium"
                },
                {
                    text: "Opportunity to discuss leadership experience in more detail", 
                    suggestion: "Share examples of mentoring or leading technical decisions",
                    priority: "low"
                }
            ],
            entities: {
                names: ["Sarah"],
                companies: hasCompanies ? ["Google", "Microsoft", "AWS"] : ["TechCorp"],
                technologies: hasTech ? [
                    "JavaScript", "React", "Node.js", "Python", "AWS", 
                    "Socket.io", "JWT", "Redis", "WebSocket"
                ] : ["JavaScript", "React"],
                roles: ["Full-stack Developer", "Software Engineer"]
            },
            timeline: [
                {
                    section: "introduction",
                    content: "Background and experience discussion",
                    keyPoints: ["5 years experience", "Full-stack development", "JavaScript expertise"]
                },
                {
                    section: "technical",
                    content: "Real-time chat application system design",
                    keyPoints: ["WebSocket implementation", "System architecture", "Scaling strategies"]
                },
                {
                    section: "behavioral", 
                    content: "Problem-solving example with memory leak optimization",
                    keyPoints: ["Performance optimization", "Debugging skills", "40% improvement"]
                },
                {
                    section: "questions",
                    content: "Candidate questions about team and challenges",
                    keyPoints: ["Team structure interest", "Technical challenges", "Growth opportunities"]
                }
            ],
            overall: {
                recommendation: "hire",
                technicalLevel: hasTech ? "senior" : "mid", 
                communicationSkills: "excellent",
                confidence: 8,
                summary: "Strong technical candidate with excellent problem-solving skills and clear communication. Shows good depth in full-stack development and proactive learning approach."
            }
        },
        metadata: {
            model: "Demo Mode (APIs not configured)",
            timestamp: new Date().toISOString(),
            transcript_length: transcript.length,
            demo_mode: true
        }
    };
}

/**
 * Fallback analysis when JSON parsing fails
 */
function createFallbackAnalysis(rawResponse) {
    return {
        highlights: [
            { text: "AI analysis completed but response parsing failed", category: "technical_skill", confidence: 0.5 }
        ],
        improvements: [
            { text: "Please try the analysis again", suggestion: "Check API configuration", priority: "high" }
        ],
        entities: { names: [], companies: [], technologies: [], roles: [] },
        timeline: [],
        overall: {
            recommendation: "maybe",
            technicalLevel: "mid", 
            communicationSkills: "good",
            confidence: 5,
            summary: `AI analysis attempted but structured parsing failed. Raw response: ${rawResponse.substring(0, 100)}...`
        }
    };
}