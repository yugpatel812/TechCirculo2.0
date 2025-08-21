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
    private UUID authorId;
    private String authorName;
     private String authorRole;     // 👈 NEW (from User table)
    private String authorProfileUrl; // 👈 NEW (from Profile table)
    private UUID communityId;
    private String communityName;
    private String communityImageUrl; // 👈 NEW (from Community table)
    private Integer likesCount;
    private Integer commentsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String tags;
    
    // New fields for enhanced functionality
    private boolean isLiked;
    private boolean isBookmarked;
    private boolean isOwner;
}