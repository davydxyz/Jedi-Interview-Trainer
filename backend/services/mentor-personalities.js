/**
 * Mentor Personalities - Star Wars character-specific analysis contexts
 */

/**
 * Get mentor-specific analysis context
 */
export function getMentorPersonality(mentor) {
    const contexts = {
        yoda: "Focus on wisdom, patience, and learning from mistakes. Emphasize personal growth and inner strength. Use reflective language that encourages deep thinking about the candidate's journey and potential.",
        
        obiwan: "Provide strategic, balanced analysis with focus on technique and methodology. Be encouraging but realistic. Emphasize structured thinking, proper approach, and the importance of following proven principles.",
        
        vader: "Give direct, powerful feedback that identifies weaknesses clearly but also recognizes strength and potential. Be authoritative and focused on results, power, and the path to mastery through discipline."
    };
    
    return contexts[mentor] || contexts.obiwan;
}

/**
 * Get interview type specific focus areas
 */
export function getInterviewTypeContext(interviewType) {
    const contexts = {
        behavioral: "Focus on storytelling, emotional intelligence, past experiences, and cultural fit. Analyze how the candidate handles conflict, leadership situations, team dynamics, and personal growth. Look for STAR method usage and authentic examples.",
        
        technical: "Analyze problem-solving approach, technical knowledge, coding skills, and system design thinking. Evaluate algorithmic thinking, code quality, debugging skills, and ability to explain technical concepts clearly.",
        
        consulting: "Evaluate structured thinking, business acumen, framework usage, and client-facing skills. Look for case interview methodology, quantitative reasoning, hypothesis-driven thinking, and ability to synthesize complex information.",
        
        leadership: "Assess leadership style, team management, decision-making, and influence skills. Analyze examples of leading through change, handling difficult conversations, building teams, and driving results through others."
    };
    
    return contexts[interviewType] || "Provide general interview performance analysis focusing on communication, problem-solving, and overall candidate fit.";
}

/**
 * Get mentor-specific greeting messages
 */
export function getMentorGreeting(mentor, interviewType) {
    const greetings = {
        yoda: {
            behavioral: "Welcome, young one. Share your experiences, you must. Learn from your journey, we will. Much wisdom in reflection, there is.",
            technical: "Hmm. Strong with the code, are you? Your technical path, show me you will. Judge you by your algorithms, I do not - but learn from them, we must.",
            consulting: "Business problems, solve them you must. Your thinking, structured it should be. The way of logic and frameworks, teach you I will.",
            leadership: "Lead others, great responsibility it is. Your path of influence, examine we will. Strong leaders, from challenges they grow.",
            default: "Welcome, young apprentice. Share your interview transcript, you must. Analyze your performance, we will. Much to learn, you have."
        },
        
        obiwan: {
            behavioral: "Hello there! I sense great potential in your experiences. Let's analyze your behavioral responses and discover the strategic insights within your stories.",
            technical: "Greetings, fellow engineer. Your technical prowess intrigues me. Share your coding journey, and I'll provide balanced analysis of your approach and methodology.",
            consulting: "Welcome, strategist. The business galaxy is complex, but with proper framework and clear thinking, we can navigate any challenge. Let's examine your analytical prowess.",
            leadership: "A leader you aspire to be. Leadership is not about power, but about guidance and wisdom. Share your leadership experiences for strategic evaluation.",
            default: "Hello there! I see great potential in you. Share your interview experience and I'll provide strategic analysis to help you master the art of interviewing."
        },
        
        vader: {
            behavioral: "Your behavioral responses will reveal your true nature. Do not disappoint me with weak stories or poor judgment. Show me your power through examples.",
            technical: "Your technical skills are incomplete. But through discipline and focused practice, you will master the code. Show me your work, and I will forge you into a stronger engineer.",
            consulting: "Business problems require decisive action and clear thinking. Weakness in analysis leads to failure. Demonstrate your consulting power, and I will guide you to mastery.",
            leadership: "Leadership is about commanding respect and driving results. Your leadership examples will show me if you have the strength to influence others. Do not fail me.",
            default: "Your interview skills are weak. But I will make them strong. Provide your transcript, and I will show you the path to power."
        }
    };
    
    const mentorGreetings = greetings[mentor] || greetings.obiwan;
    return mentorGreetings[interviewType] || mentorGreetings.default;
}

/**
 * Get mentor-specific response formatting styles
 */
export function formatMentorResponse(analysis, mentor) {
    switch(mentor) {
        case 'yoda':
            return formatYodaResponse(analysis);
        case 'obiwan':
            return formatObiwanResponse(analysis);
        case 'vader':
            return formatVaderResponse(analysis);
        default:
            return formatObiwanResponse(analysis);
    }
}

function formatYodaResponse(analysis) {
    let response = `Hmm. Analyzed your performance, I have. Much wisdom gained through reflection, you will.\n\n`;
    
    response += `Strong in these areas, you are:\n`;
    analysis.highlights?.slice(0, 3).forEach(h => {
        response += `• ${h.text} - ${h.reasoning}\n`;
    });
    
    response += `\nImprove, you must, in these ways:\n`;
    analysis.improvements?.slice(0, 3).forEach(i => {
        response += `• ${i.text} - ${i.suggestion}\n`;
    });
    
    response += `\nRemember: Strong with the Force you are, but patience and practice, the path to mastery is. Fear leads to suffering, but growth leads to wisdom.`;
    
    return response;
}

function formatObiwanResponse(analysis) {
    let response = `I've conducted a thorough analysis of your interview performance. Here's my strategic assessment:\n\n`;
    
    response += `**Strengths Identified:**\n`;
    analysis.highlights?.slice(0, 3).forEach(h => {
        response += `• ${h.text}\n  Strategy: ${h.reasoning}\n`;
    });
    
    response += `\n**Areas for Strategic Improvement:**\n`;
    analysis.improvements?.slice(0, 3).forEach(i => {
        response += `• ${i.text}\n  Recommendation: ${i.suggestion}\n`;
    });
    
    response += `\nOverall Assessment: ${analysis.overall_recommendation?.decision || 'Promising candidate'} - Focus on the fundamentals and trust in the process. The Force will be with you.`;
    
    return response;
}

function formatVaderResponse(analysis) {
    let response = `Your performance has been... evaluated. I see both strength and weakness.\n\n`;
    
    response += `**Your power lies here:**\n`;
    analysis.highlights?.slice(0, 3).forEach(h => {
        response += `• ${h.text}\n`;
    });
    
    response += `\n**Your weaknesses must be eliminated:**\n`;
    analysis.improvements?.slice(0, 3).forEach(i => {
        response += `• ${i.text} - ${i.suggestion}\n`;
    });
    
    response += `\nDo not underestimate the power of preparation. Your destiny in interviews, you must control. Failure is not an option.`;
    
    return response;
}