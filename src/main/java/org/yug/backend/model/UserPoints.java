package org.yug.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPoints {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", referencedColumnName = "user_id")
    @JsonIgnore
    private Profile profile;
    
    @Column(name = "total_points", nullable = false)
    @Builder.Default
    private Integer totalPoints = 0;
    
    @Column(name = "current_level", nullable = false)
    @Builder.Default
    private Integer currentLevel = 1;
    
    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;
    
    @Column(name = "weekly_points", nullable = false)
    @Builder.Default
    private Integer weeklyPoints = 0;
    
    @Column(name = "monthly_points", nullable = false)
    @Builder.Default
    private Integer monthlyPoints = 0;
    
    @Column(name = "last_activity")
    private LocalDateTime lastActivity;
    
    @Column(name = "streak_updated_date")
    private LocalDateTime streakUpdatedDate;
    
    @OneToMany(mappedBy = "userPoints", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<PointsTransaction> pointsTransactions = new ArrayList<>();
    
    @OneToMany(mappedBy = "userPoints", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<UserBadge> userBadges = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Helper methods
    public void addPoints(Integer points) {
        this.totalPoints += points;
        this.weeklyPoints += points;
        this.monthlyPoints += points;
        this.lastActivity = LocalDateTime.now();
    }
    
    public void updateLevel(Integer newLevel) {
        this.currentLevel = newLevel;
    }
    
    public void updateStreak(Integer newStreak) {
        this.currentStreak = newStreak;
        this.streakUpdatedDate = LocalDateTime.now();
    }
    
    public void resetWeeklyPoints() {
        this.weeklyPoints = 0;
    }
    
    public void resetMonthlyPoints() {
        this.monthlyPoints = 0;
    }
}