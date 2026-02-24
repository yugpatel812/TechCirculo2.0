package org.yug.backend.dto.post;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostEngagementDto {
    private UUID postId;
    private Long likesCount;
    private Long commentsCount;
    private Long bookmarksCount;
    private Long totalEngagement;
    private LocalDateTime createdAt;
}