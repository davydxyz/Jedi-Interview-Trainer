/**
 * Mentor Formatter - Handles mentor personality-based response formatting
 */
class MentorFormatter {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    formatMentorAnalysis(analysis) {
        const mentor = this.stateManager.getSelectedMentor();
        if (!mentor || !MentorConfig.mentors[mentor]) {
            return this.getDefaultFormat(analysis);
        }

        const personality = MentorConfig.mentors[mentor].personality;
        return this.formatByPersonality(analysis, personality);
    }

    formatByPersonality(analysis, personality) {
        switch(personality) {
            case 'wise_ancient_teacher':
                return this.formatYodaStyle(analysis);
            case 'strategic_analytical_mentor':
                return this.formatObiWanStyle(analysis);
            case 'direct_powerful_mentor':
                return this.formatVaderStyle(analysis);
            default:
                return this.getDefaultFormat(analysis);
        }
    }

    formatYodaStyle(analysis) {
        let response = `Hmm. Analyzed your interview, I have. Much wisdom gained through reflection, you will.\n\n`;
        
        // Add timeline summary if available
        if (analysis.interview_flow && analysis.interview_flow.length > 0) {
            response += `**📅 INTERVIEW TIMELINE**\n`;
            analysis.interview_flow.forEach(section => {
                response += `• ${section.duration_estimate} - ${section.section.replace('_', ' ').toUpperCase()}\n`;
                response += `  ${section.summary}\n\n`;
            });
        }
        
        // Add entity extraction
        if (analysis.entities) {
            response += `**🏷️ KEY ENTITIES DETECTED**\n`;
            if (analysis.entities.names?.length > 0) {
                response += `Names: ${analysis.entities.names.join(', ')}\n`;
            }
            if (analysis.entities.companies?.length > 0) {
                response += `Companies: ${analysis.entities.companies.join(', ')}\n`;
            }
            if (analysis.entities.technologies?.length > 0) {
                response += `Technologies: ${analysis.entities.technologies.join(', ')}\n`;
            }
            response += `\n`;
        }
        
        response += `**✨ HIGHLIGHTS (Strong with the Force, you are)**\n`;
        analysis.highlights?.slice(0, 4).forEach((h, index) => {
            response += `${index + 1}. ${h.text}\n   Reasoning: ${h.reasoning}\n\n`;
        });
        
        response += `**⚡ AREAS FOR GROWTH (Improve, you must)**\n`;
        analysis.improvements?.slice(0, 4).forEach((i, index) => {
            response += `${index + 1}. ${i.text}\n   Path forward: ${i.suggestion}\n\n`;
        });
        
        response += `**🎯 OVERALL WISDOM**\n`;
        response += `Decision: ${analysis.overall_recommendation?.decision || 'Continue learning, you must'}\n`;
        response += `Confidence: ${analysis.overall_recommendation?.confidence || 7}/10\n\n`;
        
        response += `Remember: Strong with the Force you are, but patience and practice, the path to mastery is. 🌟`;
        
        return response;
    }

    formatObiWanStyle(analysis) {
        let response = `Hello there! I've conducted a comprehensive analysis of your interview performance.\n\n`;
        
        // Add timeline summary
        if (analysis.interview_flow && analysis.interview_flow.length > 0) {
            response += `**📊 INTERVIEW STRUCTURE ANALYSIS**\n`;
            analysis.interview_flow.forEach(section => {
                response += `• ${section.duration_estimate} | ${section.section.replace('_', ' ').toUpperCase()}\n`;
                response += `  Summary: ${section.summary}\n\n`;
            });
        }
        
        // Add entity extraction
        if (analysis.entities) {
            response += `**🔍 STRATEGIC ENTITY ANALYSIS**\n`;
            if (analysis.entities.technologies?.length > 0) {
                response += `Technical Stack Mentioned: ${analysis.entities.technologies.join(', ')}\n`;
            }
            if (analysis.entities.companies?.length > 0) {
                response += `Organizations Referenced: ${analysis.entities.companies.join(', ')}\n`;
            }
            if (analysis.entities.names?.length > 0) {
                response += `Key Personnel: ${analysis.entities.names.join(', ')}\n`;
            }
            response += `\n`;
        }
        
        response += `**💪 STRENGTHS IDENTIFIED**\n`;
        analysis.highlights?.slice(0, 4).forEach((h, index) => {
            response += `${index + 1}. ${h.text}\n   Strategic Value: ${h.reasoning}\n\n`;
        });
        
        response += `**🎯 AREAS FOR STRATEGIC IMPROVEMENT**\n`;
        analysis.improvements?.slice(0, 4).forEach((i, index) => {
            response += `${index + 1}. ${i.text}\n   Action Plan: ${i.suggestion}\n\n`;
        });
        
        response += `**📈 OVERALL STRATEGIC ASSESSMENT**\n`;
        response += `Recommendation: ${analysis.overall_recommendation?.decision || 'Promising candidate'}\n`;
        response += `Confidence Level: ${analysis.overall_recommendation?.confidence || 7}/10\n\n`;
        
        response += `Remember: Focus on the fundamentals and trust in the process. The Force will guide you to success! ⭐`;
        
        return response;
    }

    formatVaderStyle(analysis) {
        let response = `Your interview performance has been... thoroughly analyzed. I see both strength and weakness.\n\n`;
        
        // Add timeline with Vader's commanding tone
        if (analysis.interview_flow && analysis.interview_flow.length > 0) {
            response += `**⚡ INTERVIEW EXECUTION BREAKDOWN**\n`;
            analysis.interview_flow.forEach(section => {
                response += `• ${section.duration_estimate} → ${section.section.replace('_', ' ').toUpperCase()}\n`;
                response += `  Performance: ${section.summary}\n\n`;
            });
        }
        
        // Add entities with imperial authority
        if (analysis.entities) {
            response += `**🔍 INTELLIGENCE GATHERED**\n`;
            if (analysis.entities.technologies?.length > 0) {
                response += `Technical Arsenal: ${analysis.entities.technologies.join(', ')}\n`;
            }
            if (analysis.entities.companies?.length > 0) {
                response += `Corporate Entities: ${analysis.entities.companies.join(', ')}\n`;
            }
            if (analysis.entities.names?.length > 0) {
                response += `Personnel Identified: ${analysis.entities.names.join(', ')}\n`;
            }
            response += `\n`;
        }
        
        response += `**⚡ YOUR POWER LIES HERE**\n`;
        analysis.highlights?.slice(0, 4).forEach((h, index) => {
            response += `${index + 1}. ${h.text}\n   Power Source: ${h.reasoning}\n\n`;
        });
        
        response += `**🔥 WEAKNESSES MUST BE ELIMINATED**\n`;
        analysis.improvements?.slice(0, 4).forEach((i, index) => {
            response += `${index + 1}. ${i.text}\n   Path to Power: ${i.suggestion}\n\n`;
        });
        
        response += `**👑 IMPERIAL VERDICT**\n`;
        response += `Judgment: ${analysis.overall_recommendation?.decision || 'Potential sensed'}\n`;
        response += `Power Level: ${analysis.overall_recommendation?.confidence || 7}/10\n\n`;
        
        response += `Do not underestimate the power of preparation. Your destiny in interviews, you MUST control. The dark side of coding is strong with this one... 🖤`;
        
        return response;
    }

    getDefaultFormat(analysis) {
        let response = `Analysis complete. Here are the key insights:\n\n`;
        
        if (analysis.highlights?.length > 0) {
            response += `**Strengths:**\n`;
            analysis.highlights.slice(0, 3).forEach(h => {
                response += `• ${h.text}\n`;
            });
        }
        
        if (analysis.improvements?.length > 0) {
            response += `\n**Areas for Improvement:**\n`;
            analysis.improvements.slice(0, 3).forEach(i => {
                response += `• ${i.text} - ${i.suggestion}\n`;
            });
        }
        
        if (analysis.overall_recommendation) {
            response += `\n**Overall:** ${analysis.overall_recommendation.decision || 'Assessment complete'}`;
        }
        
        return response;
    }

    getPersonalityGreeting(mentorId) {
        const mentor = MentorConfig.mentors[mentorId];
        return mentor ? mentor.greeting : 'Welcome to your interview analysis session.';
    }

    formatTechnicalAssessment(assessment) {
        if (!assessment) return '';

        let formatted = `\n**Technical Assessment:**\n`;
        formatted += `Level: ${assessment.level || 'Not assessed'}\n`;
        
        if (assessment.skills_demonstrated?.length > 0) {
            formatted += `Skills: ${assessment.skills_demonstrated.join(', ')}\n`;
        }
        
        if (assessment.knowledge_gaps?.length > 0) {
            formatted += `Areas to develop: ${assessment.knowledge_gaps.join(', ')}\n`;
        }
        
        return formatted;
    }

    formatCommunicationAnalysis(communication) {
        if (!communication) return '';

        let formatted = `\n**Communication Analysis:**\n`;
        formatted += `Clarity: ${communication.clarity || 'Not assessed'}\n`;
        formatted += `Structure: ${communication.structure || 'Not assessed'}\n`;
        
        return formatted;
    }

    formatQuickSummary(analysis) {
        const highlights = analysis.highlights?.length || 0;
        const improvements = analysis.improvements?.length || 0;
        const decision = analysis.overall_recommendation?.decision || 'reviewed';
        
        return `Analysis complete: ${highlights} strengths identified, ${improvements} areas for improvement. Overall: ${decision}.`;
    }
}

// Export for module usage
window.MentorFormatter = MentorFormatter;