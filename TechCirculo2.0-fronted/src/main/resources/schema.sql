-- Points System Database Schema
-- This file contains all the DDL statements to create the points system tables

-- Create user_points table
CREATE TABLE user_points (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    total_points INT NOT NULL DEFAULT 0,
    current_level INT NOT NULL DEFAULT 1,
    current_streak INT NOT NULL DEFAULT 0,
    max_streak INT NOT NULL DEFAULT 0,
    last_activity TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint (assuming profile table exists)
    CONSTRAINT fk_user_points_profile 
        FOREIGN KEY (profile_id) 
        REFERENCES profile(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint to ensure one record per user
    CONSTRAINT uk_user_points_profile UNIQUE (profile_id),
    
    -- Check constraints
    CONSTRAINT chk_total_points_positive CHECK (total_points >= 0),
    CONSTRAINT chk_current_level_positive CHECK (current_level >= 1),
    CONSTRAINT chk_current_streak_non_negative CHECK (current_streak >= 0),
    CONSTRAINT chk_max_streak_non_negative CHECK (max_streak >= 0)
);

-- Create badges table
CREATE TABLE badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for badge code
    CONSTRAINT uk_badge_code UNIQUE (code)
);

-- Create user_badges table (junction table for user-badge relationship)
CREATE TABLE user_badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_points_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_user_badges_user_points 
        FOREIGN KEY (user_points_id) 
        REFERENCES user_points(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_user_badges_badge 
        FOREIGN KEY (badge_id) 
        REFERENCES badges(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate badge awards
    CONSTRAINT uk_user_badge UNIQUE (user_points_id, badge_id)
);

-- Create points_transactions table
CREATE TABLE points_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_points_id BIGINT NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    points_awarded INT NOT NULL,
    reference_id VARCHAR(100),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_points_transactions_user_points 
        FOREIGN KEY (user_points_id) 
        REFERENCES user_points(id) 
        ON DELETE CASCADE,
    
    -- Index for performance
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at),
    INDEX idx_user_points_created (user_points_id, created_at)
);

-- Insert default badges
INSERT INTO badges (code, name, description, icon) VALUES
('FIRST_POST', 'First Post', 'Create your first post', '🎯'),
('ACTIVE_USER', 'Active User', 'Reach 100 points', '⭐'),
('LEVEL_MASTER', 'Level Master', 'Reach level 5', '🏆'),
('STREAK_KEEPER', 'Streak Keeper', 'Maintain a 7-day streak', '🔥'),
('COMMUNITY_LEADER', 'Community Leader', 'Get 50 likes on posts', '👑'),
('HELPFUL_MEMBER', 'Helpful Member', 'Create 10 helpful comments', '🤝'),
('COURSE_CHAMPION', 'Course Champion', 'Complete 5 courses', '📚'),
('EVENT_ENTHUSIAST', 'Event Enthusiast', 'Attend 3 events', '🎪'),
('SOCIAL_BUTTERFLY', 'Social Butterfly', 'Join 5 communities', '🦋'),
('KNOWLEDGE_SEEKER', 'Knowledge Seeker', 'Complete profile 100%', '🔍'),
('ENGAGEMENT_KING', 'Engagement King', 'Get 100 total likes', '👑'),
('MENTOR', 'Mentor', 'Help 20 community members', '🎓'),
('INNOVATOR', 'Innovator', 'Share 10 original posts', '💡'),
('CONSISTENT', 'Consistent', 'Maintain 30-day streak', '📅'),
('POPULAR', 'Popular', 'Get featured post', '⭐');

-- Create indexes for better performance
CREATE INDEX idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX idx_user_points_current_level ON user_points(current_level DESC);
CREATE INDEX idx_user_points_current_streak ON user_points(current_streak DESC);
CREATE INDEX idx_points_transactions_activity_points ON points_transactions(activity_type, points_awarded);

-- Sample data for testing (optional - remove in production)
-- This assumes you have profile records with IDs 1, 2, 3

-- INSERT INTO user_points (profile_id, total_points, current_level, current_streak, max_streak) VALUES
-- (1, 2847, 8, 12, 15),
-- (2, 3421, 10, 8, 20),
-- (3, 2156, 6, 5, 12);

-- INSERT INTO points_transactions (user_points_id, activity_type, points_awarded, reference_id) VALUES
-- (1, 'POST_CREATED', 10, 'post_123'),
-- (1, 'POST_LIKED', 2, 'post_123'),
-- (1, 'DAILY_LOGIN', 1, NULL),
-- (2, 'COURSE_COMPLETED', 100, 'course_456'),
-- (2, 'EVENT_ATTENDED', 25, 'event_789'),
-- (3, 'COMMENT_CREATED', 5, 'comment_321');

-- INSERT INTO user_badges (user_points_id, badge_id) VALUES
-- (1, 1), (1, 2), (1, 4),  -- User 1 has First Post, Active User, Streak Keeper
-- (2, 1), (2, 2), (2, 3), (2, 7),  -- User 2 has multiple badges
-- (3, 1), (3, 2);  -- User 3 has basic badges

-- Add database constraints and triggers for data integrity

-- Trigger to update updated_at timestamp
DELIMITER $$
CREATE TRIGGER tr_user_points_updated_at
    BEFORE UPDATE ON user_points
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- View for leaderboard (optional but useful)
CREATE VIEW leaderboard_view AS
SELECT 
    up.id,
    up.profile_id,
    p.name as username,
    up.total_points,
    up.current_level,
    up.current_streak,
    up.max_streak,
    COUNT(ub.id) as badge_count,
    ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as rank_position
FROM user_points up
JOIN profile p ON up.profile_id = p.id
LEFT JOIN user_badges ub ON up.id = ub.user_points_id
GROUP BY up.id, up.profile_id, p.name, up.total_points, up.current_level, up.current_streak, up.max_streak
ORDER BY up.total_points DESC;

-- View for user activity summary
CREATE VIEW user_activity_summary AS
SELECT 
    up.profile_id,
    p.name as username,
    up.total_points,
    up.current_level,
    COUNT(pt.id) as total_activities,
    SUM(CASE WHEN pt.activity_type = 'POST_CREATED' THEN 1 ELSE 0 END) as posts_created,
    SUM(CASE WHEN pt.activity_type = 'COMMENT_CREATED' THEN 1 ELSE 0 END) as comments_created,
    SUM(CASE WHEN pt.activity_type = 'DAILY_LOGIN' THEN 1 ELSE 0 END) as login_days,
    COUNT(ub.id) as badges_earned
FROM user_points up
JOIN profile p ON up.profile_id = p.id
LEFT JOIN points_transactions pt ON up.id = pt.user_points_id
LEFT JOIN user_badges ub ON up.id = ub.user_points_id
GROUP BY up.profile_id, p.name, up.total_points, up.current_level;