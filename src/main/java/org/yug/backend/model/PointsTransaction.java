package org.yug.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "points_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointsTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_points_id", nullable = false)
    private UserPoints userPoints;
    
    @Column(name = "activity_type", nullable = false)
    private String activityType;
    
    @Column(name = "activity_category", nullable = false)
    private String activityCategory;
    
    @Column(name = "points_awarded", nullable = false)
    private Integer pointsAwarded;
    
    @Column(name = "multiplier", nullable = false)
    @Builder.Default
    private Double multiplier = 1.0;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON string for additional data
    
    @Column(name = "reference_id") // For linking to posts, comments, etc.
    private Long referenceId;
    
    @Column(name = "reference_type") // POST, COMMENT, TUTORIAL, etc.
    private String referenceType;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}