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
public class UserBadgeDTO {
    
    private Long id;
    private String badgeKey;
    private String name;
    private String description;
    private String icon;
    private String category;
    private Integer pointsReward;
    private LocalDateTime earnedAt;
    private Boolean notified;
}