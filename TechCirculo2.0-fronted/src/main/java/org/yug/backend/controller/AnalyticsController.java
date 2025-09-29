package org.yug.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.yug.backend.model.UserPoints;
import org.yug.backend.model.Profile;
import org.yug.backend.service.PointsService;
import org.yug.backend.dto.points.UserPointsDTO;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(
    origins = {
        "http://localhost:5500", 
        "http://127.0.0.1:5500",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8084",
        "http://127.0.0.1:8084"
    },
    allowCredentials = "false"
)
public class AnalyticsController {

    @Autowired
    private PointsService pointsService;
    
    /**
     * Public leaderboard endpoint for analytics dashboard
     * Does not require authentication
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<Map<String, Object>> getPublicLeaderboard(
            @RequestParam(defaultValue = "50") int limit) {
        
        try {
            List<UserPoints> leaderboard = pointsService.getLeaderboard();
            
            // Limit results
            List<UserPoints> limitedLeaderboard = leaderboard.stream()
                    .limit(limit)
                    .toList();
            
            // Convert to DTOs with only public information
            List<UserPointsDTO> leaderboardDTOs = limitedLeaderboard.stream()
                    .map(userPoints -> {
                        Profile profile = userPoints.getProfile();
                        return UserPointsDTO.builder()
                                .id(userPoints.getId())
                                .profileId(profile != null ? profile.getId().getMostSignificantBits() : 0L)
                                .username(profile != null && profile.getUser() != null ? profile.getUser().getUsername() : "User" + userPoints.getId())
                                .displayName(profile != null ? (profile.getName() != null ? profile.getName() : profile.getUser().getUsername()) : "User" + userPoints.getId())
                                .fullName(profile != null ? profile.getName() : "Anonymous User")
                                .totalPoints(userPoints.getTotalPoints())
                                .currentLevel(userPoints.getCurrentLevel())
                                .currentStreak(userPoints.getCurrentStreak())
                                .weeklyPoints(userPoints.getWeeklyPoints())
                                .monthlyPoints(userPoints.getMonthlyPoints())
                                .lastActivity(userPoints.getLastActivity())
                                .build();
                    })
                    .toList();
            
            // Create response with metadata
            Map<String, Object> response = new HashMap<>();
            response.put("leaderboard", leaderboardDTOs);
            response.put("total", leaderboard.size());
            response.put("limit", limit);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in getPublicLeaderboard: " + e.getMessage());
            e.printStackTrace();
            
            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch leaderboard");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("leaderboard", List.of());
            errorResponse.put("total", 0);
            errorResponse.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Get analytics stats for dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAnalyticsStats() {
        try {
            List<UserPoints> allUsers = pointsService.getLeaderboard();
            
            // Calculate statistics
            int totalUsers = allUsers.size();
            long totalPoints = allUsers.stream()
                    .mapToLong(up -> up.getTotalPoints())
                    .sum();
            
            int activeUsers = (int) allUsers.stream()
                    .filter(up -> up.getTotalPoints() > 0)
                    .count();
            
            // Create stats response
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("totalPoints", totalPoints);
            stats.put("activeUsers", activeUsers);
            stats.put("averagePoints", totalUsers > 0 ? (double) totalPoints / totalUsers : 0.0);
            stats.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            System.err.println("Error in getAnalyticsStats: " + e.getMessage());
            
            // Return default stats on error
            Map<String, Object> defaultStats = new HashMap<>();
            defaultStats.put("totalUsers", 0);
            defaultStats.put("totalPoints", 0L);
            defaultStats.put("activeUsers", 0);
            defaultStats.put("averagePoints", 0.0);
            defaultStats.put("error", e.getMessage());
            defaultStats.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(defaultStats);
        }
    }
    
    /**
     * Get user distribution by levels
     */
    @GetMapping("/user-levels")
    public ResponseEntity<Map<String, Object>> getUserLevels() {
        try {
            List<UserPoints> allUsers = pointsService.getLeaderboard();
            
            // Group users by level
            Map<Integer, Long> levelDistribution = allUsers.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            UserPoints::getCurrentLevel,
                            java.util.stream.Collectors.counting()
                    ));
            
            Map<String, Object> response = new HashMap<>();
            response.put("levelDistribution", levelDistribution);
            response.put("totalUsers", allUsers.size());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in getUserLevels: " + e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("levelDistribution", Map.of());
            errorResponse.put("totalUsers", 0);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Health check for analytics
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Analytics API");
        health.put("timestamp", System.currentTimeMillis());
        health.put("version", "1.0.0");
        
        return ResponseEntity.ok(health);
    }
}