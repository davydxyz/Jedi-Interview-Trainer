/**
 * Mentor Configuration - Static data for mentors and demo content
 */
const MentorConfig = {
    mentors: {
        yoda: {
            name: 'Master Yoda',
            avatar: 'headshots/Yoda.png',
            greeting: 'Welcome, young apprentice. Share your interview transcript, you must. Analyze your performance, we will. Much to learn, you have.',
            personality: 'wise_ancient_teacher'
        },
        obiwan: {
            name: 'Obi-Wan Kenobi',
            avatar: 'headshots/Obiwan.png', 
            greeting: 'Hello there! I see great potential in you. Share your interview experience and I\'ll provide strategic analysis to help you master the art of interviewing.',
            personality: 'strategic_analytical_mentor'
        },
        vader: {
            name: 'Darth Vader',
            avatar: 'headshots/Darth_Vadar.png',
            greeting: 'Your interview skills are weak. But I will make them strong. Provide your transcript, and I will show you the path to power.',
            personality: 'direct_powerful_mentor'
        }
    },

    demoData: {
        technical: `Interviewer: Can you walk me through how you would design a URL shortener like bit.ly?

Candidate: Sure, I'd start by understanding the requirements. We need to shorten long URLs, redirect users when they click the short URL, and handle high traffic.

For the system design, I'd use a hash function or base62 encoding to generate short codes. The database would store mappings between short codes and original URLs.

For scalability, I'd implement caching with Redis, use a load balancer, and consider database sharding if we reach millions of URLs.

I'd also add analytics to track click counts and consider rate limiting to prevent abuse.

Interviewer: How would you handle the case where two users submit the same URL?

Candidate: Good question. I'd check if the URL already exists in our database before generating a new short code. If it exists, I'd return the existing short URL. This saves storage space and maintains consistency.

Alternatively, if users want personalized short URLs, I could generate unique codes per user, but that would require more storage.`,

        behavioral: `Interviewer: Tell me about a time when you had to work with a difficult team member.

Candidate: In my previous role, I worked with a senior developer who was very critical of others' code but wasn't collaborative in providing solutions. This created tension in our team.

I approached the situation by first trying to understand their perspective. I scheduled a one-on-one coffee chat and learned they were concerned about code quality because of past production issues.

I suggested we implement code review guidelines and pair programming sessions. This channeled their expertise constructively and improved our team's code quality.

The result was that they became more collaborative, and our team's code quality improved significantly. I learned the importance of understanding underlying motivations before addressing behavioral issues.

Interviewer: How do you handle competing priorities when everything seems urgent?

Candidate: I start by clarifying the true business impact and deadlines with stakeholders. I've found that not everything marked as 'urgent' actually is.

I use a priority matrix to evaluate tasks based on impact and effort. I communicate transparently with stakeholders about trade-offs and get alignment on priorities.

For example, in my last role, I had three 'urgent' features requested by different teams. After discussion, we realized one could wait, one needed immediate attention for a client demo, and one could be partially implemented.

I also try to identify dependencies and tackle those first to unblock others.`,

        case_study: `Interviewer: How would you estimate the market size for electric scooters in San Francisco?

Candidate: I'd use a bottom-up approach. San Francisco has roughly 900,000 residents. Assuming 60% are adults aged 18-65 who could potentially use scooters, that's 540,000 people.

Of these, maybe 30% would consider using shared scooters based on commuting patterns and lifestyle. That's 162,000 potential users.

If each user takes 4 trips per month on average, that's 648,000 trips monthly. At $3 per trip average, the monthly market size would be approximately $1.9 million, or $23 million annually.`,

        leadership: `Interviewer: Tell me about a time you had to lead a team through a difficult situation.

Candidate: I was promoted to team lead just as our department faced a 30% budget cut and had to reduce headcount. Team morale was very low, and productivity was suffering.

I started by having one-on-one meetings with each team member to understand their concerns and perspectives. I was transparent about the challenges while focusing on what we could control.

I restructured workflows to be more efficient, cross-trained team members to handle multiple functions, and implemented weekly check-ins to maintain communication.

Most importantly, I advocated upward for my team, securing training budgets and performance bonuses for those who stepped up. Within six months, our output actually increased by 15% despite fewer resources.

Interviewer: How do you motivate underperforming team members?

Candidate: I believe in addressing performance issues early and directly. I'd first seek to understand root causes - is it skill gaps, lack of clarity, personal issues, or motivation problems?

I'd work with them to create a clear improvement plan with specific goals and timelines. I'd provide additional support, training, or resources as needed.

Regular feedback and recognition for progress is crucial. Sometimes reassignment to better-fit roles is necessary. If performance doesn't improve after reasonable support, I'd work with HR on next steps.`
    }
};

// Export for module usage
window.MentorConfig = MentorConfig;