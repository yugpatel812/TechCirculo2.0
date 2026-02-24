package org.yug.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.yug.backend.model.UserPoints;
import org.yug.backend.model.Profile;
import org.yug.backend.model.PointsTransaction;
import org.yug.backend.model.UserBadge;
import org.yug.backend.service.PointsService;
import org.yug.backend.repository.ProfileRepository;
import org.yug.backend.dto.points.UserPointsDTO;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/points")
public class PointsController {

    @Autowired
    private PointsService pointsService;

    @Autowired
    private ProfileRepository profileRepository;
    
    // Debug endpoint to test authentication
    @GetMapping("/debug/auth")
    public ResponseEntity<String> debugAuth(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok("No authenticated user");
        }
        return ResponseEntity.ok("Authenticated user: " + userDetails.getUsername());
    }
    
    // Debug endpoint to check profile existence
    @GetMapping("/debug/profile")
    public ResponseEntity<String> debugProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.badRequest().body("No authenticated user");
        }
        
        Optional<Profile> profile = profileRepository.findByUser_Username(userDetails.getUsername());
        if (profile.isPresent()) {
            return ResponseEntity.ok("Profile found: " + profile.get().getId() + ", Name: " + profile.get().getName());
        } else {
            return ResponseEntity.ok("Profile not found for user: " + userDetails.getUsername());
        }
    }

    @GetMapping("/my-points")
    public ResponseEntity<UserPointsDTO> getMyPoints(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("Authenticated user: " + userDetails.getUsername());
            
            Profile profile = profileRepository.findByUser_Username(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Profile not found for user: " + userDetails.getUsername()));
            
            System.out.println("Profile found: " + profile.getId());
            
            UserPoints userPoints = pointsService.getUserPoints(profile.getId());
            
            System.out.println("UserPoints: " + userPoints.getTotalPoints() + " points");
            
            // Convert to DTO to avoid circular reference issues
            UserPointsDTO dto = UserPointsDTO.builder()
                    .id(userPoints.getId())
                    .profileId(profile.getId().getMostSignificantBits()) // Convert UUID to Long
                    .username(userDetails.getUsername())
                    .fullName(profile.getName() != null ? profile.getName() : userDetails.getUsername())
                    .totalPoints(userPoints.getTotalPoints())
                    .currentLevel(userPoints.getCurrentLevel())
                    .currentStreak(userPoints.getCurrentStreak())
                    .weeklyPoints(userPoints.getWeeklyPoints())
                    .monthlyPoints(userPoints.getMonthlyPoints())
                    .lastActivity(userPoints.getLastActivity())
                    .build();
            
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.err.println("Error in getMyPoints: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get user points: " + e.getMessage(), e);
        }
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserPointsDTO>> getLeaderboard() {
        List<UserPoints> leaderboard = pointsService.getLeaderboard();
        
        // Convert to DTOs to avoid circular reference issues
        List<UserPointsDTO> leaderboardDTOs = leaderboard.stream()
                .map(userPoints -> {
                    Profile profile = userPoints.getProfile();
                    return UserPointsDTO.builder()
                            .id(userPoints.getId())
                            .profileId(profile != null ? profile.getId().getMostSignificantBits() : 0L)
                            .username(profile != null && profile.getUser() != null ? profile.getUser().getUsername() : "Unknown")
                            .fullName(profile != null ? profile.getName() : "Unknown User")
                            .totalPoints(userPoints.getTotalPoints())
                            .currentLevel(userPoints.getCurrentLevel())
                            .currentStreak(userPoints.getCurrentStreak())
                            .weeklyPoints(userPoints.getWeeklyPoints())
                            .monthlyPoints(userPoints.getMonthlyPoints())
                            .lastActivity(userPoints.getLastActivity())
                            .build();
                })
                .toList();
        
        return ResponseEntity.ok(leaderboardDTOs);
    }

    @PostMapping("/award/{profileId}")
    public ResponseEntity<UserPointsDTO> awardPoints(
            @PathVariable UUID profileId,
            @RequestParam int points,
            @RequestParam String reason) {
        
        UserPoints updatedPoints = pointsService.awardPoints(profileId, points, reason);
        
        // Convert to DTO
        UserPointsDTO dto = UserPointsDTO.builder()
                .id(updatedPoints.getId())
                .totalPoints(updatedPoints.getTotalPoints())
                .currentLevel(updatedPoints.getCurrentLevel())
                .currentStreak(updatedPoints.getCurrentStreak())
                .weeklyPoints(updatedPoints.getWeeklyPoints())
                .monthlyPoints(updatedPoints.getMonthlyPoints())
                .lastActivity(updatedPoints.getLastActivity())
                .build();
        
        return ResponseEntity.ok(dto);
    }
    
    // Award points for current user
    @PostMapping("/award")
    public ResponseEntity<UserPointsDTO> awardPointsToCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam int points,
            @RequestParam String reason) {
        
        Profile profile = profileRepository.findByUser_Username(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        UserPoints updatedPoints = pointsService.awardPoints(profile.getId(), points, reason);
        
        UserPointsDTO dto = UserPointsDTO.builder()
                .id(updatedPoints.getId())
                .username(userDetails.getUsername())
                .totalPoints(updatedPoints.getTotalPoints())
                .currentLevel(updatedPoints.getCurrentLevel())
                .currentStreak(updatedPoints.getCurrentStreak())
                .weeklyPoints(updatedPoints.getWeeklyPoints())
                .monthlyPoints(updatedPoints.getMonthlyPoints())
                .lastActivity(updatedPoints.getLastActivity())
                .build();
        
        return ResponseEntity.ok(dto);
    }
    
    // Test award points (for testing WebSocket)
    @PostMapping("/test-award")
    public ResponseEntity<UserPointsDTO> testAwardPoints(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "10") int points,
            @RequestParam(defaultValue = "Test points award") String reason) {
        
        try {
            Profile profile = profileRepository.findByUser_Username(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Profile not found"));
            
            UserPoints updatedPoints = pointsService.awardPoints(profile.getId(), points, reason);
            
            UserPointsDTO dto = UserPointsDTO.builder()
                    .id(updatedPoints.getId())
                    .username(userDetails.getUsername())
                    .totalPoints(updatedPoints.getTotalPoints())
                    .currentLevel(updatedPoints.getCurrentLevel())
                    .currentStreak(updatedPoints.getCurrentStreak())
                    .weeklyPoints(updatedPoints.getWeeklyPoints())
                    .monthlyPoints(updatedPoints.getMonthlyPoints())
                    .lastActivity(updatedPoints.getLastActivity())
                    .build();
            
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.err.println("Error awarding test points: " + e.getMessage());
            throw new RuntimeException("Failed to award points: " + e.getMessage());
        }
    }

    // Award points for specific activity
    @PostMapping("/award-activity")
    public ResponseEntity<UserPointsDTO> awardPointsForActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String activityType,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long referenceId,
            @RequestParam(required = false) String referenceType) {
        
        try {
            Profile profile = profileRepository.findByUser_Username(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Profile not found"));
            
            String activityDescription = description != null ? description : "Activity: " + activityType;
            UserPoints updatedPoints = pointsService.awardPointsForActivity(
                    profile.getId(), activityType, activityDescription, referenceId, referenceType);
            
            UserPointsDTO dto = UserPointsDTO.builder()
                    .id(updatedPoints.getId())
                    .username(userDetails.getUsername())
                    .totalPoints(updatedPoints.getTotalPoints())
                    .currentLevel(updatedPoints.getCurrentLevel())
                    .currentStreak(updatedPoints.getCurrentStreak())
                    .weeklyPoints(updatedPoints.getWeeklyPoints())
                    .monthlyPoints(updatedPoints.getMonthlyPoints())
                    .lastActivity(updatedPoints.getLastActivity())
                    .build();
            
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.err.println("Error awarding points for activity: " + e.getMessage());
            throw new RuntimeException("Failed to award points: " + e.getMessage());
        }
    }
    
    // Get user rank
    @GetMapping("/my-rank")
    public ResponseEntity<Object> getMyRank(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Profile profile = profileRepository.findByUser_Username(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Profile not found"));
            
            // For now, return a simple rank response
            return ResponseEntity.ok(new Object() {
                public final Integer rank = 1; // Placeholder
                public final Integer totalUsers = 10; // Placeholder
            });
        } catch (Exception e) {
            return ResponseEntity.ok(new Object() {
                public final Integer rank = null;
                public final Integer totalUsers = 0;
            });
        }
    }
    
    // Get user history
    @GetMapping("/my-history")
    public ResponseEntity<List<Object>> getMyHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "20") int limit) {
        
        try {
            Profile profile = profileRepository.findByUser_Username(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Profile not found"));
            
            List<PointsTransaction> transactions = pointsService.getUserTransactionHistory(profile.getId(), limit);
            
            // Convert to simple objects for JSON response
            List<Object> historyItems = transactions.stream()
                    .<Object>map(transaction -> new Object() {
                        public final String activityType = transaction.getActivityType();
                        public final String description = transaction.getDescription();
                        public final Integer pointsAwarded = transaction.getPointsAwarded();
                        public final String createdAt = transaction.getCreatedAt().toString();
                    })
                    .toList();
            
            return ResponseEntity.ok(historyItems);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }
    
    // Get user badges
    @GetMapping("/my-badges")
    public ResponseEntity<List<Object>> getMyBadges(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Profile profile = profileRepository.findByUser_Username(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Profile not found"));
            
            List<UserBadge> userBadges = pointsService.getUserBadges(profile.getId());
            
            // Convert to simple objects for JSON response
            List<Object> badgeItems = userBadges.stream()
                    .<Object>map(userBadge -> new Object() {
                        public final String badgeName = userBadge.getBadge().getName();
                        public final String badgeDescription = userBadge.getBadge().getDescription();
                        public final String badgeIcon = userBadge.getBadge().getIcon();
                        public final String earnedAt = userBadge.getEarnedAt().toString();
                    })
                    .toList();
            
            return ResponseEntity.ok(badgeItems);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }
}