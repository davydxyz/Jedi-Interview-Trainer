/**
 * Demo Analysis Generator - Provides fallback analysis data
 */

class DemoAnalysisGenerator {
    
    /**
     * Generate demo analysis for fallback with mentor personality and interview type
     */
    static generateDemoAnalysis(transcript, mentor, interviewType) {
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
     * Get mentor-specific analysis context
     */
    static getMentorContext(mentor) {
        const contexts = {
            yoda: "Focus on wisdom, patience, and learning from mistakes. Emphasize personal growth and inner strength.",
            obiwan: "Provide strategic, balanced analysis with focus on technique and methodology. Be encouraging but realistic.", 
            vader: "Give direct, powerful feedback that identifies weaknesses clearly but also recognizes strength and potential."
        };
        return contexts[mentor] || contexts.obiwan;
    }

    /**
     * Get interview type specific focus areas
     */
    static getInterviewTypeContext(interviewType) {
        const contexts = {
            behavioral: "Focus on storytelling, emotional intelligence, past experiences, and cultural fit.",
            technical: "Analyze problem-solving approach, technical knowledge, coding skills, and system design thinking.",
            consulting: "Evaluate structured thinking, business acumen, framework usage, and client-facing skills.",
            leadership: "Assess leadership style, team management, decision-making, and influence skills."
        };
        return contexts[interviewType] || "Provide general interview performance analysis.";
    }
}

module.exports = DemoAnalysisGenerator; 