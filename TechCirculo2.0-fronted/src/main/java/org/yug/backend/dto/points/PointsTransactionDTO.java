package org.yug.backend.dto.points;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PointsTransactionDTO {
    
    private Long id;
    private String username;
    private String fullName;
    private String activityType;
    private String activityCategory;
    private Integer pointsAwarded;
    private Double multiplier;
    private String description;
    private String metadata;
    private Long referenceId;
    private String referenceType;
    private LocalDateTime createdAt;
    private String timeAgo; // Human readable time like "2 minutes ago"
    private String icon; // FontAwesome icon for activity
    private String color; // Color for category
}