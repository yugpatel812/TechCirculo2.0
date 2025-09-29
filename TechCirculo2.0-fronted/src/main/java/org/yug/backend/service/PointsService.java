package org.yug.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yug.backend.controller.WebSocketController;
import org.yug.backend.model.UserPoints;
import org.yug.backend.model.Profile;
import org.yug.backend.model.PointsTransaction;
import org.yug.backend.model.Badge;
import org.yug.backend.model.UserBadge;
import org.yug.backend.repository.UserPointsRepository;
import org.yug.backend.repository.ProfileRepository;
import org.yug.backend.repository.PointsTransactionRepository;
import org.yug.backend.repository.BadgeRepository;
import org.yug.backend.repository.UserBadgeRepository;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PointsService {

    @Autowired
    private UserPointsRepository userPointsRepository;

    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private PointsTransactionRepository pointsTransactionRepository;
    
    @Autowired
    private BadgeRepository badgeRepository;
    
    @Autowired
    private UserBadgeRepository userBadgeRepository;
    
    @Autowired
    private WebSocketController webSocketController;

    public UserPoints getUserPoints(UUID profileId) {
        return userPointsRepository.findByProfileId(profileId)
                .orElseGet(() -> createInitialUserPoints(profileId));
    }

    private UserPoints createInitialUserPoints(UUID profileId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        UserPoints userPoints = UserPoints.builder()
                .profile(profile)
                .totalPoints(0)
                .currentLevel(1)
                .currentStreak(0)
                .build();
        
        return userPointsRepository.save(userPoints);
    }

    public UserPoints awardPoints(UUID profileId, int points, String reason) {
        UserPoints userPoints = getUserPoints(profileId);
        int oldLevel = userPoints.getCurrentLevel();
        userPoints.addPoints(points);
        
        // Update level based on points
        updateUserLevel(userPoints);
        
        // Save updated points first
        UserPoints savedUserPoints = userPointsRepository.save(userPoints);
        
        // Create transaction record
        createTransaction(savedUserPoints, "MANUAL_AWARD", "ADMIN", points, reason, null, null);
        
        // Check for level up badges
        if (savedUserPoints.getCurrentLevel() > oldLevel) {
            checkAndAwardLevelUpBadges(savedUserPoints);
        }
        
        // Check for other badges and collect newly awarded ones
        List<Badge> newBadges = checkAndAwardBadges(savedUserPoints);
        
        // Send real-time update via WebSocket
        Profile profile = savedUserPoints.getProfile();
        String badgeNames = newBadges.isEmpty() ? null : 
                newBadges.stream().map(Badge::getName).reduce((a, b) -> a + ", " + b).orElse(null);
        
        if (profile != null && profile.getUser() != null) {
            webSocketController.sendPointsUpdate(
                    profile.getUser().getUsername(), 
                    savedUserPoints.getTotalPoints(), 
                    points, 
                    reason,
                    badgeNames
            );
        }
        
        return savedUserPoints;
    }

    private void updateUserLevel(UserPoints userPoints) {
        int currentLevel = calculateLevel(userPoints.getTotalPoints());
        userPoints.updateLevel(currentLevel);
    }

    private int calculateLevel(int totalPoints) {
        // Simple level calculation: every 100 points = 1 level
        return (totalPoints / 100) + 1;
    }

    public List<UserPoints> getLeaderboard() {
        return userPointsRepository.findTopUsersByPoints();
    }
    
    /**
     * Award points for specific activity type with automatic transaction logging
     */
    public UserPoints awardPointsForActivity(UUID profileId, String activityType, String description, Long referenceId, String referenceType) {
        UserPoints userPoints = getUserPoints(profileId);
        int oldLevel = userPoints.getCurrentLevel();
        
        // Get points for activity type
        int points = getPointsForActivity(activityType);
        userPoints.addPoints(points);
        
        // Update level
        updateUserLevel(userPoints);
        UserPoints savedUserPoints = userPointsRepository.save(userPoints);
        
        // Create transaction record
        createTransaction(savedUserPoints, activityType, getCategoryForActivity(activityType), 
                         points, description, referenceId, referenceType);
        
        // Check for level up badges
        if (savedUserPoints.getCurrentLevel() > oldLevel) {
            checkAndAwardLevelUpBadges(savedUserPoints);
        }
        
        // Check for other badges and collect newly awarded ones
        List<Badge> newBadges = checkAndAwardBadges(savedUserPoints);
        
        // Send real-time update via WebSocket
        Profile profile = savedUserPoints.getProfile();
        String badgeNames = newBadges.isEmpty() ? null : 
                newBadges.stream().map(Badge::getName).reduce((a, b) -> a + ", " + b).orElse(null);
        
        if (profile != null && profile.getUser() != null) {
            webSocketController.sendPointsUpdate(
                    profile.getUser().getUsername(), 
                    savedUserPoints.getTotalPoints(), 
                    points, 
                    description,
                    badgeNames
            );
        }
        
        return savedUserPoints;
    }
    
    /**
     * Get user's transaction history
     */
    public List<PointsTransaction> getUserTransactionHistory(UUID profileId, int limit) {
        UserPoints userPoints = getUserPoints(profileId);
        List<PointsTransaction> transactions = pointsTransactionRepository.findByUserPointsOrderByCreatedAtDesc(userPoints);
        return transactions.stream().limit(limit).toList();
    }
    
    /**
     * Get user's badges
     */
    public List<UserBadge> getUserBadges(UUID profileId) {
        UserPoints userPoints = getUserPoints(profileId);
        return userBadgeRepository.findByUserPointsOrderByEarnedAtDesc(userPoints);
    }
    
    /**
     * Create a transaction record
     */
    private void createTransaction(UserPoints userPoints, String activityType, String category, 
                                  int points, String description, Long referenceId, String referenceType) {
        PointsTransaction transaction = PointsTransaction.builder()
                .userPoints(userPoints)
                .activityType(activityType)
                .activityCategory(category)
                .pointsAwarded(points)
                .description(description)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();
                
        pointsTransactionRepository.save(transaction);
    }
    
    /**
     * Get points for activity type
     */
    private int getPointsForActivity(String activityType) {
        return switch (activityType) {
            case "POST_CREATED" -> 10;
            case "POST_LIKED" -> 2;
            case "COMMENT_CREATED" -> 5;
            case "COMMENT_LIKED" -> 1;
            case "PROFILE_COMPLETED" -> 20;
            case "DAILY_LOGIN" -> 5;
            case "WEEKLY_STREAK" -> 25;
            case "EVENT_ATTENDED" -> 15;
            case "COURSE_COMPLETED" -> 50;
            case "LEVEL_UP" -> 100;
            default -> 1;
        };
    }
    
    /**
     * Get category for activity type
     */
    private String getCategoryForActivity(String activityType) {
        return switch (activityType) {
            case "POST_CREATED", "POST_LIKED", "COMMENT_CREATED", "COMMENT_LIKED" -> "COMMUNITY";
            case "PROFILE_COMPLETED" -> "PROFILE";
            case "DAILY_LOGIN", "WEEKLY_STREAK" -> "ENGAGEMENT";
            case "EVENT_ATTENDED", "COURSE_COMPLETED" -> "LEARNING";
            case "LEVEL_UP" -> "ACHIEVEMENT";
            default -> "GENERAL";
        };
    }
    
    /**
     * Check and award level up badges
     */
    private void checkAndAwardLevelUpBadges(UserPoints userPoints) {
        List<Badge> levelBadges = badgeRepository.findByConditionTypeAndIsActive("LEVEL_REACHED", true);
        
        for (Badge badge : levelBadges) {
            if (userPoints.getCurrentLevel() >= badge.getConditionValue()) {
                // Check if user already has this badge
                boolean alreadyHas = userBadgeRepository.existsByUserPointsAndBadge(userPoints, badge);
                if (!alreadyHas) {
                    awardBadge(userPoints, badge);
                }
            }
        }
    }
    
    /**
     * Check and award other badges based on user activity
     */
    private List<Badge> checkAndAwardBadges(UserPoints userPoints) {
        List<Badge> newlyAwardedBadges = new java.util.ArrayList<>();
        
        // Check points-based badges
        List<Badge> pointsBadges = badgeRepository.findByConditionTypeAndIsActive("POINTS_TOTAL", true);
        for (Badge badge : pointsBadges) {
            if (userPoints.getTotalPoints() >= badge.getConditionValue()) {
                boolean alreadyHas = userBadgeRepository.existsByUserPointsAndBadge(userPoints, badge);
                if (!alreadyHas) {
                    awardBadge(userPoints, badge);
                    newlyAwardedBadges.add(badge);
                }
            }
        }
        
        // Check streak-based badges
        List<Badge> streakBadges = badgeRepository.findByConditionTypeAndIsActive("STREAK_DAYS", true);
        for (Badge badge : streakBadges) {
            if (userPoints.getCurrentStreak() >= badge.getConditionValue()) {
                boolean alreadyHas = userBadgeRepository.existsByUserPointsAndBadge(userPoints, badge);
                if (!alreadyHas) {
                    awardBadge(userPoints, badge);
                    newlyAwardedBadges.add(badge);
                }
            }
        }
        
        return newlyAwardedBadges;
    }
    
    /**
     * Award a badge to the user
     */
    private void awardBadge(UserPoints userPoints, Badge badge) {
        UserBadge userBadge = UserBadge.builder()
                .userPoints(userPoints)
                .badge(badge)
                .build();
                
        userBadgeRepository.save(userBadge);
        
        // Award bonus points for earning badge
        if (badge.getPointsReward() > 0) {
            userPoints.addPoints(badge.getPointsReward());
            userPointsRepository.save(userPoints);
            
            // Create transaction for badge bonus
            createTransaction(userPoints, "BADGE_EARNED", "ACHIEVEMENT", 
                            badge.getPointsReward(), "Earned badge: " + badge.getName(), 
                            badge.getId(), "BADGE");
        }
    }
}