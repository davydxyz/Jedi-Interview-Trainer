/**
 * Response Parser - JSON validation and fallback handling
 */

/**
 * Parse and validate the AI response
 */
export function parseAndValidateResponse(responseText, originalTranscript) {
    try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : responseText;
        
        const parsed = JSON.parse(jsonText);
        
        // Validate required fields and provide defaults
        const validated = {
            highlights: validateHighlights(parsed.highlights),
            improvements: validateImprovements(parsed.improvements),
            technical_assessment: validateTechnicalAssessment(parsed.technical_assessment),
            communication_analysis: validateCommunicationAnalysis(parsed.communication_analysis),
            entities: validateEntities(parsed.entities),
            interview_flow: validateInterviewFlow(parsed.interview_flow),
            overall_recommendation: validateOverallRecommendation(parsed.overall_recommendation),
            interview_quality: validateInterviewQuality(parsed.interview_quality)
        };
        
        console.log('✅ Response validation successful');
        return validated;
        
    } catch (parseError) {
        console.error('❌ Failed to parse DeepSeek response:', parseError.message);
        console.log('Raw response:', responseText.substring(0, 500));
        
        // Return structured fallback
        return createFallbackAnalysis(originalTranscript, responseText);
    }
}

/**
 * Validation functions for each section
 */
function validateHighlights(highlights) {
    if (!Array.isArray(highlights)) return [];
    
    return highlights.slice(0, 6).map(h => ({
        text: h.text || 'Analysis completed',
        category: h.category || 'general',
        confidence: typeof h.confidence === 'number' ? h.confidence : 0.7,
        reasoning: h.reasoning || 'Identified as positive indicator'
    }));
}

function validateImprovements(improvements) {
    if (!Array.isArray(improvements)) return [];
    
    return improvements.slice(0, 4).map(i => ({
        text: i.text || 'Area for development identified',
        suggestion: i.suggestion || 'Recommend focused practice',
        priority: ['high', 'medium', 'low'].includes(i.priority) ? i.priority : 'medium',
        category: i.category || 'general'
    }));
}

function validateTechnicalAssessment(tech) {
    return {
        level: ['junior', 'mid', 'senior', 'staff', 'principal'].includes(tech?.level) ? tech.level : 'mid',
        skills_demonstrated: Array.isArray(tech?.skills_demonstrated) ? tech.skills_demonstrated.slice(0, 8) : [],
        knowledge_gaps: Array.isArray(tech?.knowledge_gaps) ? tech.knowledge_gaps.slice(0, 4) : [],
        problem_solving_approach: tech?.problem_solving_approach || 'Structured problem-solving approach observed'
    };
}

function validateCommunicationAnalysis(comm) {
    return {
        clarity: ['poor', 'fair', 'good', 'excellent'].includes(comm?.clarity) ? comm.clarity : 'good',
        structure: comm?.structure || 'Well-organized responses',
        listening: comm?.listening || 'Good comprehension of questions',
        questioning: comm?.questioning || 'Asked relevant follow-up questions'
    };
}

function validateEntities(entities) {
    return {
        technologies: Array.isArray(entities?.technologies) ? entities.technologies.slice(0, 10) : [],
        companies: Array.isArray(entities?.companies) ? entities.companies.slice(0, 5) : [],
        projects: Array.isArray(entities?.projects) ? entities.projects.slice(0, 5) : [],
        methodologies: Array.isArray(entities?.methodologies) ? entities.methodologies.slice(0, 5) : []
    };
}

function validateInterviewFlow(flow) {
    if (!Array.isArray(flow)) return [];
    
    return flow.slice(0, 8).map(f => ({
        section: f.section || 'discussion',
        summary: f.summary || 'Interview section covered',
        key_moments: Array.isArray(f.key_moments) ? f.key_moments.slice(0, 3) : [],
        duration_estimate: f.duration_estimate || '5-10 minutes'
    }));
}

function validateOverallRecommendation(rec) {
    return {
        decision: ['strong_hire', 'hire', 'maybe', 'no_hire'].includes(rec?.decision) ? rec.decision : 'maybe',
        confidence: typeof rec?.confidence === 'number' ? Math.max(1, Math.min(10, rec.confidence)) : 7,
        key_strengths: Array.isArray(rec?.key_strengths) ? rec.key_strengths.slice(0, 4) : ['Analysis completed'],
        main_concerns: Array.isArray(rec?.main_concerns) ? rec.main_concerns.slice(0, 3) : [],
        cultural_fit: rec?.cultural_fit || 'Positive indicators for team collaboration',
        next_steps: rec?.next_steps || 'Recommend technical deep-dive interview'
    };
}

function validateInterviewQuality(quality) {
    return {
        questions_effectiveness: quality?.questions_effectiveness || 'Standard interview questions covered relevant topics',
        areas_not_explored: Array.isArray(quality?.areas_not_explored) ? quality.areas_not_explored.slice(0, 3) : [],
        suggested_follow_ups: Array.isArray(quality?.suggested_follow_ups) ? quality.suggested_follow_ups.slice(0, 4) : []
    };
}

/**
 * Fallback analysis when JSON parsing fails
 */
export function createFallbackAnalysis(transcript, rawResponse) {
    return {
        highlights: [{ 
            text: "AI analysis completed but response parsing failed", 
            category: "general", 
            confidence: 0.5, 
            reasoning: "Technical issue with response format" 
        }],
        improvements: [{ 
            text: "Please retry the analysis", 
            suggestion: "The AI provided analysis but in an unexpected format", 
            priority: "high", 
            category: "technical" 
        }],
        technical_assessment: { 
            level: "unknown", 
            skills_demonstrated: [], 
            knowledge_gaps: ["Analysis incomplete"], 
            problem_solving_approach: "Unable to assess due to parsing error" 
        },
        communication_analysis: { 
            clarity: "unknown", 
            structure: "Unable to assess", 
            listening: "Unable to assess", 
            questioning: "Unable to assess" 
        },
        entities: { 
            technologies: [], 
            companies: [], 
            projects: [], 
            methodologies: [] 
        },
        interview_flow: [],
        overall_recommendation: { 
            decision: "maybe", 
            confidence: 5, 
            key_strengths: ["Requires manual review"], 
            main_concerns: ["Analysis parsing failed"], 
            cultural_fit: "Unable to assess", 
            next_steps: "Manual review recommended" 
        },
        interview_quality: { 
            questions_effectiveness: "Unable to assess due to technical issue", 
            areas_not_explored: [], 
            suggested_follow_ups: [] 
        }
    };
}

/**
 * Validate JSON structure before sending to client
 */
export function validateAnalysisStructure(analysis) {
    const required = [
        'highlights', 
        'improvements', 
        'technical_assessment', 
        'communication_analysis', 
        'entities', 
        'interview_flow', 
        'overall_recommendation', 
        'interview_quality'
    ];
    
    const missing = required.filter(field => !analysis.hasOwnProperty(field));
    
    if (missing.length > 0) {
        console.warn('⚠️ Missing analysis fields:', missing);
        return false;
    }
    
    return true;
}