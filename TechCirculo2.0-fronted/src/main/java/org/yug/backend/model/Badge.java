package org.yug.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "badge_key", unique = true, nullable = false)
    private String badgeKey; // Unique identifier like "first_post", "helpful_member"
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "icon")
    private String icon; // FontAwesome icon class
    
    @Column(name = "category")
    private String category; // COMMUNITY, LEARNING, STREAK, etc.
    
    @Column(name = "points_reward", nullable = false)
    @Builder.Default
    private Integer pointsReward = 0;
    
    @Column(name = "condition_type")
    private String conditionType; // POST_COUNT, STREAK_DAYS, POINTS_TOTAL, etc.
    
    @Column(name = "condition_value")
    private Integer conditionValue; // The threshold value for earning
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}