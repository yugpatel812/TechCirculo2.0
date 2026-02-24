-- Sample data for Points System testing
-- Run this after schema.sql to populate with test data

-- Note: This assumes you have existing profile records
-- Update the profile_id values to match your actual profile table

-- Sample user points data
INSERT INTO user_points (profile_id, total_points, current_level, current_streak, max_streak, last_activity) VALUES
(1, 2847, 8, 12, 15, '2024-01-20 10:30:00'),
(2, 3421, 10, 8, 20, '2024-01-20 09:15:00'),
(3, 2156, 6, 5, 12, '2024-01-19 16:45:00'),
(4, 1890, 5, 3, 8, '2024-01-19 14:20:00'),
(5, 1645, 4, 15, 15, '2024-01-20 11:00:00');

-- Sample points transactions (last 30 transactions for realistic activity feed)
INSERT INTO points_transactions (user_points_id, activity_type, points_awarded, reference_id, metadata, created_at) VALUES
-- User 1 activities
(1, 'DAILY_LOGIN', 1, NULL, '{"loginStreak": 12}', '2024-01-20 08:00:00'),
(1, 'POST_CREATED', 10, 'post_101', '{"communityId": 1, "postTitle": "React Best Practices"}', '2024-01-20 10:30:00'),
(1, 'POST_LIKED', 2, 'post_101', '{"likerUserId": 2}', '2024-01-20 11:00:00'),
(1, 'COMMENT_CREATED', 5, 'comment_201', '{"postId": "post_99", "communityId": 1}', '2024-01-19 15:20:00'),
(1, 'COMMENT_LIKED', 1, 'comment_201', '{"likerUserId": 3}', '2024-01-19 16:00:00'),
(1, 'WEEKLY_STREAK', 50, NULL, '{"streakDays": 7}', '2024-01-19 00:00:00'),

-- User 2 activities  
(2, 'COURSE_COMPLETED', 100, 'course_301', '{"courseTitle": "Advanced JavaScript", "duration": "8 hours"}', '2024-01-20 09:15:00'),
(2, 'EVENT_ATTENDED', 25, 'event_401', '{"eventName": "Tech Meetup 2024", "duration": "3 hours"}', '2024-01-19 18:00:00'),
(2, 'POST_CREATED', 10, 'post_102', '{"communityId": 2, "postTitle": "Machine Learning Trends"}', '2024-01-19 14:30:00'),
(2, 'POST_LIKED', 2, 'post_102', '{"likerUserId": 1}', '2024-01-19 15:00:00'),
(2, 'POST_LIKED', 2, 'post_102', '{"likerUserId": 4}', '2024-01-19 16:30:00'),
(2, 'LEVEL_UP', 100, NULL, '{"newLevel": 10}', '2024-01-19 09:15:00'),

-- User 3 activities
(3, 'PROFILE_COMPLETED', 20, NULL, '{"completionPercentage": 100}', '2024-01-19 16:45:00'),
(3, 'COMMENT_CREATED', 5, 'comment_202', '{"postId": "post_102", "communityId": 2}', '2024-01-19 16:30:00'),
(3, 'DAILY_LOGIN', 1, NULL, '{"loginStreak": 5}', '2024-01-19 08:30:00'),
(3, 'POST_LIKED', 2, 'post_101', '{"authorUserId": 1}', '2024-01-18 12:00:00'),

-- User 4 activities
(4, 'POST_CREATED', 10, 'post_103', '{"communityId": 3, "postTitle": "DevOps Pipeline Setup"}', '2024-01-19 14:20:00'),
(4, 'COMMENT_CREATED', 5, 'comment_203', '{"postId": "post_101", "communityId": 1}', '2024-01-19 11:15:00'),
(4, 'COMMENT_LIKED', 1, 'comment_203', '{"likerUserId": 5}', '2024-01-19 12:00:00'),
(4, 'DAILY_LOGIN', 1, NULL, '{"loginStreak": 3}', '2024-01-19 07:45:00'),

-- User 5 activities (most recent streak keeper)
(5, 'DAILY_LOGIN', 1, NULL, '{"loginStreak": 15}', '2024-01-20 11:00:00'),
(5, 'POST_LIKED', 2, 'post_103', '{"authorUserId": 4}', '2024-01-19 20:30:00'),
(5, 'COMMENT_CREATED', 5, 'comment_204', '{"postId": "post_103", "communityId": 3}', '2024-01-19 19:00:00'),
(5, 'WEEKLY_STREAK', 50, NULL, '{"streakDays": 14}', '2024-01-18 00:00:00'),
(5, 'LEVEL_UP', 40, NULL, '{"newLevel": 4}', '2024-01-17 10:00:00');

-- Sample user badges (achievements earned)
INSERT INTO user_badges (user_points_id, badge_id, earned_at) VALUES
-- User 1 badges
(1, 1, '2024-01-10 10:00:00'), -- First Post
(1, 2, '2024-01-12 15:30:00'), -- Active User  
(1, 4, '2024-01-19 00:00:00'), -- Streak Keeper

-- User 2 badges (most accomplished)
(2, 1, '2024-01-08 09:00:00'), -- First Post
(2, 2, '2024-01-09 14:00:00'), -- Active User
(2, 3, '2024-01-15 16:00:00'), -- Level Master
(2, 7, '2024-01-20 09:15:00'), -- Course Champion
(2, 8, '2024-01-19 18:00:00'), -- Event Enthusiast

-- User 3 badges
(3, 1, '2024-01-15 12:00:00'), -- First Post
(3, 2, '2024-01-17 10:00:00'), -- Active User
(3, 10, '2024-01-19 16:45:00'), -- Knowledge Seeker (completed profile)

-- User 4 badges  
(4, 1, '2024-01-16 14:00:00'), -- First Post
(4, 2, '2024-01-18 11:00:00'), -- Active User

-- User 5 badges
(5, 1, '2024-01-12 16:00:00'), -- First Post
(5, 2, '2024-01-14 13:00:00'), -- Active User
(5, 4, '2024-01-18 00:00:00'), -- Streak Keeper
(5, 14, '2024-01-18 00:00:00'); -- Consistent (30-day streak)

-- Additional sample transactions for more realistic activity feed
INSERT INTO points_transactions (user_points_id, activity_type, points_awarded, reference_id, created_at) VALUES
(1, 'POST_LIKED', 2, 'post_104', '2024-01-18 14:30:00'),
(2, 'COMMENT_CREATED', 5, 'comment_205', '2024-01-18 16:00:00'),
(3, 'POST_CREATED', 10, 'post_105', '2024-01-18 10:15:00'),
(4, 'COMMENT_LIKED', 1, 'comment_206', '2024-01-18 12:45:00'),
(5, 'POST_LIKED', 2, 'post_105', '2024-01-18 11:30:00'),
(1, 'COMMENT_CREATED', 5, 'comment_207', '2024-01-17 17:20:00'),
(2, 'POST_LIKED', 2, 'post_106', '2024-01-17 13:15:00'),
(3, 'DAILY_LOGIN', 1, NULL, '2024-01-17 08:00:00'),
(4, 'POST_CREATED', 10, 'post_107', '2024-01-17 11:45:00'),
(5, 'COMMENT_CREATED', 5, 'comment_208', '2024-01-17 19:30:00');

-- Sample queries to verify the data

-- Check leaderboard
-- SELECT * FROM leaderboard_view LIMIT 10;

-- Check user activity summary  
-- SELECT * FROM user_activity_summary;

-- Check recent activities across all users
-- SELECT 
--     up.profile_id,
--     p.name as username,
--     pt.activity_type,
--     pt.points_awarded,
--     pt.created_at
-- FROM points_transactions pt
-- JOIN user_points up ON pt.user_points_id = up.id  
-- JOIN profile p ON up.profile_id = p.id
-- ORDER BY pt.created_at DESC
-- LIMIT 20;

-- Check badges per user
-- SELECT 
--     p.name as username,
--     b.name as badge_name,
--     b.icon,
--     ub.earned_at
-- FROM user_badges ub
-- JOIN user_points up ON ub.user_points_id = up.id
-- JOIN profile p ON up.profile_id = p.id
-- JOIN badges b ON ub.badge_id = b.id
-- ORDER BY p.name, ub.earned_at;