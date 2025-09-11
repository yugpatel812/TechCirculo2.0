package org.yug.backend.dto.community;

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
public class CommunityPostDto {
    private UUID id;
    private String title;
    private String content;
    private String imageUrl;

    // Author details
    private UUID authorId;
    private String authorName;
    private String authorRole;
    private String authorProfileUrl;

    // Community details
    private UUID communityId;
    private String communityName;
    private String communityImageUrl;

    // Engagement
    private Integer likesCount;
    private Integer commentsCount;

    // Time
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Tags
    private String tags;

    // User context fields (⚡ rename them!)
    private boolean likedByMe;
    private boolean bookmarked;
    private boolean owner;
}
