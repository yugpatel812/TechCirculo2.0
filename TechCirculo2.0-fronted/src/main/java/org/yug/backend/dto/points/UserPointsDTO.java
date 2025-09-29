package org.yug.backend.dto.points;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserPointsDTO {
    
    private Long id;
    private Long profileId;
    private String username;
    private String displayName;
    private String fullName;
    private String role;
    private String profilePicture;
    private Integer totalPoints;
    private Integer currentLevel;
    private String levelTitle;
    private String levelColor;
    private Integer currentStreak;
    private Integer weeklyPoints;
    private Integer monthlyPoints;
    private Integer weeklyChange;
    private LocalDateTime lastActivity;
    private String status; // online, away, offline
    private String location;
    private String bio;
    private List<String> skills;
    private List<UserBadgeDTO> badges;
    private Integer rank; // Position in leaderboard
    private Integer progressToNextLevel; // Percentage
    private Integer pointsToNextLevel;
    private String initials;
    
    // Level information
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LevelInfo {
        private Integer level;
        private String title;
        private String color;
        private Integer minPoints;
        private Integer maxPoints;
    }
}