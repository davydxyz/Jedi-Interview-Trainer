/**
 * Intelligent Follow-up Service
 * Generates contextual, high-value follow-up questions based on conversation analysis
 */

import OpenAI from 'openai';

// Initialize OpenRouter client for DeepSeek access
function getOpenRouterClient() {
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
        console.log('❌ OpenRouter API key not configured');
        return null;
    }
    
    return new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY
    });
}

/**
 * Generate intelligent follow-up questions based on conversation context
 */
export async function generateFollowupSuggestions(conversationContext) {
    try {
        const { 
            originalTranscript, 
            mentorResponse, 
            mentor, 
            interviewType,
            conversationHistory = []
        } = conversationContext;

        console.log('🧠 Generating follow-up suggestions...');
        console.log('📋 Context:', { mentor, interviewType, responseLength: mentorResponse?.length || 0 });

        const client = getOpenRouterClient();
        if (!client) {
            return getMockFollowupSuggestions(interviewType, mentor);
        }

        const analysisPrompt = createFollowupAnalysisPrompt({
            originalTranscript,
            mentorResponse,
            mentor,
            interviewType,
            conversationHistory
        });

        const response = await client.chat.completions.create({
            model: "deepseek/deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "You are an expert interview coach specializing in generating strategic follow-up questions. Your goal is to identify gaps in the conversation and suggest high-value questions that will unlock deeper insights."
                },
                {
                    role: "user",
                    content: analysisPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 800
        });

        const aiResponse = response.choices[0]?.message?.content;
        console.log('✅ DeepSeek follow-up analysis completed');

        // Parse the AI response to extract structured suggestions
        const suggestions = parseFollowupResponse(aiResponse);
        
        return {
            success: true,
            suggestions: suggestions,
            metadata: {
                model: 'deepseek-chat',
                timestamp: new Date().toISOString(),
                interviewType,
                mentor,
                suggestionsCount: suggestions.length
            }
        };

    } catch (error) {
        console.error('❌ Follow-up generation failed:', error);
        
        // Fallback to intelligent template-based suggestions
        console.log('🔄 Falling back to template-based suggestions');
        return getMockFollowupSuggestions(interviewType, mentor);
    }
}

/**
 * Create sophisticated prompt for follow-up analysis
 */
function createFollowupAnalysisPrompt({ originalTranscript, mentorResponse, mentor, interviewType, conversationHistory }) {
    const mentorPersonalities = {
        yoda: "wise, philosophical, focuses on deeper understanding and reflection",
        obiwan: "strategic, analytical, emphasizes process and methodology", 
        vader: "direct, results-focused, pushes for accountability and performance"
    };

    const interviewFocusAreas = {
        behavioral: "leadership scenarios, team dynamics, conflict resolution, decision-making process",
        technical: "system design, scalability, problem-solving approach, implementation details",
        consulting: "business strategy, data analysis, client management, stakeholder communication",
        leadership: "team building, strategic vision, change management, organizational impact"
    };

    return `
CONTEXT ANALYSIS:
- Interview Type: ${interviewType.toUpperCase()} 
- Mentor Personality: ${mentor.toUpperCase()} (${mentorPersonalities[mentor] || 'balanced approach'})
- Focus Areas: ${interviewFocusAreas[interviewType] || 'general interview skills'}

ORIGINAL USER INPUT:
"${originalTranscript}"

MENTOR'S RESPONSE:
"${mentorResponse}"

TASK: Generate 3 strategic follow-up questions that will help the user get deeper, more valuable insights. Consider:

1. GAPS ANALYSIS: What important aspects did the mentor's response NOT fully address?
2. SPECIFICITY OPPORTUNITIES: Where can we push for more concrete examples, metrics, or details?
3. IMPLEMENTATION FOCUS: What practical next steps or real-world application questions would be valuable?
4. CHALLENGE SCENARIOS: What "what if" situations would test their understanding?
5. MENTOR ALIGNMENT: How can we leverage this mentor's strengths (${mentorPersonalities[mentor]})?

RESPONSE FORMAT (JSON):
{
  "suggestions": [
    {
      "question": "Specific, actionable follow-up question",
      "category": "IMPLEMENTATION|SPECIFICITY|CHALLENGES|DEPTH|SCALE",
      "reasoning": "Why this question adds value"
    }
  ]
}

QUALITY STANDARDS:
- Questions should be specific to the context provided
- Each question should unlock different types of insights
- Avoid generic questions that could apply to any situation
- Focus on what would differentiate a junior vs senior response
- Consider the interview level and push for appropriate depth

Generate exactly 3 high-value follow-up questions now:`;
}

/**
 * Parse AI response and extract structured suggestions
 */
function parseFollowupResponse(aiResponse) {
    try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.suggestions || [];
        }
        
        // Fallback: parse line by line if JSON parsing fails
        const lines = aiResponse.split('\n').filter(line => line.trim().length > 0);
        const suggestions = [];
        
        let currentSuggestion = null;
        
        for (const line of lines) {
            if (line.includes('question') || line.startsWith('-') || line.match(/^\d+\./)) {
                if (currentSuggestion) {
                    suggestions.push(currentSuggestion);
                }
                
                const questionText = line.replace(/^[\d\-\*\s]+/, '').replace(/["']/g, '').trim();
                currentSuggestion = {
                    question: questionText,
                    category: inferCategory(questionText),
                    reasoning: "AI-generated strategic follow-up"
                };
            }
        }
        
        if (currentSuggestion) {
            suggestions.push(currentSuggestion);
        }
        
        return suggestions.slice(0, 3); // Limit to 3 suggestions
        
    } catch (error) {
        console.error('❌ Failed to parse AI response:', error);
        return [];
    }
}

/**
 * Infer category from question content
 */
function inferCategory(question) {
    const q = question.toLowerCase();
    
    if (q.includes('example') || q.includes('specific') || q.includes('instance')) {
        return 'SPECIFICITY';
    } else if (q.includes('implement') || q.includes('execute') || q.includes('plan') || q.includes('step')) {
        return 'IMPLEMENTATION';  
    } else if (q.includes('what if') || q.includes('challenge') || q.includes('problem') || q.includes('difficult')) {
        return 'CHALLENGES';
    } else if (q.includes('scale') || q.includes('grow') || q.includes('million') || q.includes('enterprise')) {
        return 'SCALE';
    } else {
        return 'DEPTH';
    }
}

/**
 * Fallback intelligent template-based suggestions
 */
function getMockFollowupSuggestions(interviewType, mentor) {
    const templates = {
        behavioral: [
            {
                question: "Can you walk me through a specific example where this approach didn't work as expected?",
                category: "SPECIFICITY",
                reasoning: "Pushes for real-world failure scenarios and learning"
            },
            {
                question: "How would you adapt this strategy when working with a remote or distributed team?",
                category: "CHALLENGES", 
                reasoning: "Tests adaptability to modern work environments"
            },
            {
                question: "What metrics would you track to measure the success of this approach over the first 90 days?",
                category: "IMPLEMENTATION",
                reasoning: "Focuses on concrete measurement and accountability"
            }
        ],
        technical: [
            {
                question: "How would this solution perform at 10x scale, and what bottlenecks would you anticipate?",
                category: "SCALE",
                reasoning: "Tests understanding of scalability challenges"
            },
            {
                question: "What edge cases or failure scenarios should I be prepared to discuss in detail?",
                category: "CHALLENGES",
                reasoning: "Identifies potential weak points in the solution"
            },
            {
                question: "Walk me through your testing strategy and what monitoring you'd implement.",
                category: "IMPLEMENTATION", 
                reasoning: "Focuses on production readiness and operational concerns"
            }
        ],
        consulting: [
            {
                question: "What additional data would you need to validate this hypothesis, and how would you prioritize gathering it?",
                category: "SPECIFICITY",
                reasoning: "Tests analytical rigor and data-driven thinking"
            },
            {
                question: "How would you communicate these findings to a skeptical C-level audience?",
                category: "IMPLEMENTATION",
                reasoning: "Focuses on stakeholder management and communication"
            },
            {
                question: "What would your risk mitigation strategy look like if this recommendation doesn't deliver expected results?",
                category: "CHALLENGES",
                reasoning: "Tests strategic thinking and contingency planning"
            }
        ],
        leadership: [
            {
                question: "How would you handle pushback from a senior team member who disagrees with this direction?",
                category: "CHALLENGES",
                reasoning: "Tests conflict resolution and influence without authority"
            },
            {
                question: "What would your first 100 days execution plan look like, including key stakeholder engagement?",
                category: "IMPLEMENTATION",
                reasoning: "Focuses on practical leadership transition and execution"
            },
            {
                question: "How would you measure and communicate the cultural impact of this change to the broader organization?",
                category: "DEPTH",
                reasoning: "Tests understanding of organizational dynamics and change management"
            }
        ]
    };

    // Add mentor-specific flavoring
    const suggestions = templates[interviewType] || templates.behavioral;
    
    return {
        success: true,
        suggestions: suggestions,
        metadata: {
            model: 'template-based',
            timestamp: new Date().toISOString(),
            interviewType,
            mentor,
            fallback: true
        }
    };
}

/**
 * Analyze conversation context to determine if follow-ups should be enabled
 */
export function shouldEnableFollowups(conversationHistory) {
    // Enable follow-ups after the mentor has provided at least one substantial response
    const mentorResponses = conversationHistory.filter(msg => 
        msg.role === 'assistant' && msg.content.length > 100
    );
    
    return mentorResponses.length > 0;
}