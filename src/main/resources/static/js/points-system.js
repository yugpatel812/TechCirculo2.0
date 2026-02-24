/**
 * TechCirculo Points Grading System
 * Real-time points calculation and tracking for user activities
 */

// Points Configuration System
const POINTS_CONFIG = {
    // Community Participation Points
    COMMUNITY: {
        CREATE_POST: 10,
        COMMENT_ON_POST: 5,
        LIKE_POST: 1,
        SHARE_POST: 3,
        JOIN_COMMUNITY: 20,
        CREATE_COMMUNITY: 50,
        MODERATE_COMMUNITY: 15,
        FEATURED_POST: 25,
        TRENDING_POST: 30,
        WEEKLY_TOP_CONTRIBUTOR: 100
    },

    // Learning & Education Points
    LEARNING: {
        COMPLETE_TUTORIAL: 15,
        SUBMIT_ASSIGNMENT: 25,
        PASS_QUIZ: 20,
        PERFECT_QUIZ_SCORE: 50,
        ATTEND_WEBINAR: 30,
        COMPLETE_COURSE: 100,
        CERTIFICATION_EARNED: 200,
        SKILL_ASSESSMENT_PASS: 75,
        STUDY_STREAK_DAILY: 5,
        STUDY_STREAK_WEEKLY: 35
    },

    // Help & Mentoring Points
    MENTORING: {
        ANSWER_QUESTION: 15,
        ACCEPTED_ANSWER: 30,
        HELP_JUNIOR: 20,
        MENTOR_SESSION: 40,
        SOLVE_BUG_REPORT: 25,
        CODE_REVIEW: 20,
        PROVIDE_FEEDBACK: 10,
        EXPERT_ANSWER: 50,
        TEACHING_CONTRIBUTION: 60,
        KNOWLEDGE_SHARE: 35
    },

    // Achievement & Recognition Points
    ACHIEVEMENTS: {
        FIRST_POST: 25,
        FIRST_COMMENT: 10,
        FIRST_LIKE: 5,
        PROFILE_COMPLETION: 50,
        UPLOAD_PROFILE_PICTURE: 10,
        VERIFY_EMAIL: 15,
        CONNECT_SOCIAL_MEDIA: 5,
        REFERRAL_SIGNUP: 30,
        FEEDBACK_SUBMITTED: 10,
        BETA_TESTER: 75
    },

    // Project & Code Points
    PROJECT: {
        CREATE_PROJECT: 40,
        UPLOAD_CODE: 20,
        FORK_PROJECT: 10,
        STAR_PROJECT: 5,
        CONTRIBUTE_TO_PROJECT: 35,
        MERGE_PULL_REQUEST: 45,
        REPORT_ISSUE: 15,
        FIX_ISSUE: 30,
        DEPLOY_PROJECT: 50,
        OPEN_SOURCE_CONTRIBUTION: 75
    },

    // Social & Network Points
    SOCIAL: {
        FOLLOW_USER: 2,
        GET_FOLLOWED: 5,
        NETWORK_CONNECTION: 10,
        ENDORSEMENT_RECEIVED: 15,
        ENDORSEMENT_GIVEN: 5,
        RECOMMENDATION_WRITTEN: 25,
        RECOMMENDATION_RECEIVED: 20,
        INTERVIEW_PREPARATION: 30,
        JOB_REFERRAL: 100,
        SUCCESS_STORY_SHARE: 50
    },

    // Event & Competition Points
    EVENTS: {
        EVENT_ATTENDANCE: 40,
        EVENT_SPEAKER: 100,
        HACKATHON_PARTICIPATION: 75,
        HACKATHON_WIN: 200,
        COMPETITION_ENTRY: 50,
        COMPETITION_WIN: 150,
        WORKSHOP_COMPLETION: 60,
        CONFERENCE_PRESENTATION: 120,
        PANEL_DISCUSSION: 80,
        TECH_TALK_DELIVERY: 90
    },

    // Content Creation Points
    CONTENT: {
        WRITE_BLOG_POST: 40,
        CREATE_TUTORIAL: 60,
        RECORD_VIDEO: 50,
        CREATE_INFOGRAPHIC: 35,
        PODCAST_EPISODE: 70,
        DOCUMENTATION_UPDATE: 25,
        TRANSLATION_CONTRIBUTION: 30,
        RESOURCE_CURATION: 20,
        CASE_STUDY_WRITE: 80,
        BEST_PRACTICE_SHARE: 45
    }
};

// Level System Configuration
const LEVEL_SYSTEM = {
    1: { minPoints: 0, maxPoints: 100, title: "Beginner", color: "#6b7280" },
    2: { minPoints: 101, maxPoints: 300, title: "Explorer", color: "#10b981" },
    3: { minPoints: 301, maxPoints: 600, title: "Contributor", color: "#3b82f6" },
    4: { minPoints: 601, maxPoints: 1000, title: "Active Member", color: "#8b5cf6" },
    5: { minPoints: 1001, maxPoints: 1500, title: "Community Helper", color: "#f59e0b" },
    6: { minPoints: 1501, maxPoints: 2500, title: "Mentor", color: "#ef4444" },
    7: { minPoints: 2501, maxPoints: 4000, title: "Expert", color: "#06b6d4" },
    8: { minPoints: 4001, maxPoints: 6000, title: "Tech Lead", color: "#8b5cf6" },
    9: { minPoints: 6001, maxPoints: 8500, title: "Senior Expert", color: "#f59e0b" },
    10: { minPoints: 8501, maxPoints: 12000, title: "Community Leader", color: "#ef4444" },
    11: { minPoints: 12001, maxPoints: 16000, title: "Tech Influencer", color: "#10b981" },
    12: { minPoints: 16001, maxPoints: 20000, title: "Platform Champion", color: "#8b5cf6" },
    13: { minPoints: 20001, maxPoints: 25000, title: "Industry Expert", color: "#f59e0b" },
    14: { minPoints: 25001, maxPoints: 30000, title: "Thought Leader", color: "#ef4444" },
    15: { minPoints: 30001, maxPoints: Infinity, title: "Legend", color: "#ffd700" }
};

// Badge System Configuration
const BADGE_SYSTEM = {
    COMMUNITY_BADGES: {
        "first_post": {
            name: "First Steps",
            description: "Created your first post",
            icon: "fas fa-baby",
            points: 25,
            condition: (user) => user.totalPosts >= 1
        },
        "social_butterfly": {
            name: "Social Butterfly",
            description: "Made 50 comments",
            icon: "fas fa-comments",
            points: 100,
            condition: (user) => user.totalComments >= 50
        },
        "helpful_member": {
            name: "Helpful Member",
            description: "Answered 25 questions",
            icon: "fas fa-hands-helping",
            points: 200,
            condition: (user) => user.questionsAnswered >= 25
        }
    },
    LEARNING_BADGES: {
        "quick_learner": {
            name: "Quick Learner",
            description: "Completed 5 tutorials",
            icon: "fas fa-graduation-cap",
            points: 150,
            condition: (user) => user.tutorialsCompleted >= 5
        },
        "knowledge_seeker": {
            name: "Knowledge Seeker",
            description: "Attended 10 webinars",
            icon: "fas fa-search",
            points: 300,
            condition: (user) => user.webinarsAttended >= 10
        }
    },
    STREAK_BADGES: {
        "consistency_champion": {
            name: "Consistency Champion",
            description: "Maintained 30-day activity streak",
            icon: "fas fa-fire",
            points: 500,
            condition: (user) => user.currentStreak >= 30
        }
    }
};

// Points Calculator Class
class PointsCalculator {
    constructor() {
        this.pointsHistory = [];
        this.userStats = this.initializeUserStats();
    }

    initializeUserStats() {
        return {
            totalPoints: 0,
            currentLevel: 1,
            currentStreak: 0,
            totalPosts: 0,
            totalComments: 0,
            questionsAnswered: 0,
            tutorialsCompleted: 0,
            webinarsAttended: 0,
            projectsCreated: 0,
            badgesEarned: [],
            lastActivity: null,
            weeklyPoints: 0,
            monthlyPoints: 0
        };
    }

    // Award points for specific activity
    awardPoints(activity, category, multiplier = 1, metadata = {}) {
        const pointsConfig = POINTS_CONFIG[category];
        if (!pointsConfig || !pointsConfig[activity]) {
            console.warn(`Invalid activity: ${category}.${activity}`);
            return 0;
        }

        const basePoints = pointsConfig[activity];
        const finalPoints = Math.round(basePoints * multiplier);
        
        // Record the points transaction
        const transaction = {
            id: Date.now() + Math.random(),
            timestamp: new Date(),
            activity,
            category,
            points: finalPoints,
            metadata,
            description: this.getActivityDescription(activity, category, metadata)
        };

        this.pointsHistory.push(transaction);
        this.userStats.totalPoints += finalPoints;
        
        // Update weekly and monthly points
        this.updatePeriodPoints(finalPoints);
        
        // Check for level up
        const oldLevel = this.userStats.currentLevel;
        this.updateLevel();
        
        // Check for new badges
        const newBadges = this.checkForNewBadges();
        
        // Update streak
        this.updateStreak();
        
        // Trigger events
        this.triggerPointsEvent(transaction, oldLevel !== this.userStats.currentLevel, newBadges);
        
        return finalPoints;
    }

    // Get user's current level based on points
    updateLevel() {
        for (let level = 15; level >= 1; level--) {
            const levelConfig = LEVEL_SYSTEM[level];
            if (this.userStats.totalPoints >= levelConfig.minPoints) {
                this.userStats.currentLevel = level;
                break;
            }
        }
    }

    // Check for new badges earned
    checkForNewBadges() {
        const newBadges = [];
        
        Object.values(BADGE_SYSTEM).forEach(badgeCategory => {
            Object.entries(badgeCategory).forEach(([badgeKey, badge]) => {
                if (!this.userStats.badgesEarned.includes(badgeKey) && 
                    badge.condition(this.userStats)) {
                    this.userStats.badgesEarned.push(badgeKey);
                    newBadges.push(badge);
                    // Award badge points
                    this.userStats.totalPoints += badge.points;
                }
            });
        });
        
        return newBadges;
    }

    // Update activity streak
    updateStreak() {
        const now = new Date();
        const lastActivity = this.userStats.lastActivity;
        
        if (!lastActivity) {
            this.userStats.currentStreak = 1;
        } else {
            const daysDiff = Math.floor((now - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                this.userStats.currentStreak += 1;
            } else if (daysDiff > 1) {
                this.userStats.currentStreak = 1;
            }
            // If same day, keep current streak
        }
        
        this.userStats.lastActivity = now.toISOString();
    }

    // Update weekly and monthly point totals
    updatePeriodPoints(points) {
        // This would typically check dates and reset counters
        // For now, just add to running totals
        this.userStats.weeklyPoints += points;
        this.userStats.monthlyPoints += points;
    }

    // Get activity description for display
    getActivityDescription(activity, category, metadata) {
        const descriptions = {
            'CREATE_POST': `Created a new post${metadata.title ? ` "${metadata.title}"` : ''}`,
            'COMMENT_ON_POST': 'Commented on a post',
            'ANSWER_QUESTION': 'Answered a question',
            'COMPLETE_TUTORIAL': `Completed tutorial${metadata.title ? ` "${metadata.title}"` : ''}`,
            'JOIN_COMMUNITY': `Joined ${metadata.communityName || 'a community'}`,
            'HACKATHON_WIN': `Won hackathon${metadata.hackathonName ? ` "${metadata.hackathonName}"` : ''}`,
        };
        
        return descriptions[activity] || `${category}: ${activity}`;
    }

    // Trigger points-related events
    triggerPointsEvent(transaction, leveledUp, newBadges) {
        // Dispatch custom events for UI updates
        const events = [];
        
        // Points earned event
        events.push(new CustomEvent('pointsEarned', {
            detail: { transaction, totalPoints: this.userStats.totalPoints }
        }));
        
        // Level up event
        if (leveledUp) {
            events.push(new CustomEvent('levelUp', {
                detail: { 
                    newLevel: this.userStats.currentLevel,
                    levelConfig: LEVEL_SYSTEM[this.userStats.currentLevel]
                }
            }));
        }
        
        // New badges event
        if (newBadges.length > 0) {
            events.push(new CustomEvent('badgesEarned', {
                detail: { badges: newBadges }
            }));
        }
        
        // Dispatch all events
        events.forEach(event => window.dispatchEvent(event));
    }

    // Get user's current stats for display
    getUserStats() {
        return {
            ...this.userStats,
            levelConfig: LEVEL_SYSTEM[this.userStats.currentLevel],
            nextLevelPoints: LEVEL_SYSTEM[this.userStats.currentLevel + 1]?.minPoints || null,
            progressToNextLevel: this.calculateLevelProgress()
        };
    }

    // Calculate progress to next level
    calculateLevelProgress() {
        const currentLevel = LEVEL_SYSTEM[this.userStats.currentLevel];
        const nextLevel = LEVEL_SYSTEM[this.userStats.currentLevel + 1];
        
        if (!nextLevel) return 100; // Max level reached
        
        const currentLevelPoints = this.userStats.totalPoints - currentLevel.minPoints;
        const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints;
        
        return Math.round((currentLevelPoints / pointsNeeded) * 100);
    }

    // Get recent points history
    getRecentActivity(limit = 10) {
        return this.pointsHistory
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    // Get leaderboard data
    getLeaderboardPosition(allUsers) {
        const sortedUsers = allUsers.sort((a, b) => b.totalPoints - a.totalPoints);
        return sortedUsers.findIndex(user => user.id === this.userStats.id) + 1;
    }
}

// Export for use in other files
window.PointsCalculator = PointsCalculator;
window.POINTS_CONFIG = POINTS_CONFIG;
window.LEVEL_SYSTEM = LEVEL_SYSTEM;
window.BADGE_SYSTEM = BADGE_SYSTEM;

console.log('Points Grading System loaded successfully!');