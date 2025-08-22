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
public class PostDto {
    private UUID id;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;

    // Author details
    private UUID authorId;
    private String authorName;

    // Likes
    private long likeCount;       // total likes
    private boolean likedByMe;    // if current user liked

}
