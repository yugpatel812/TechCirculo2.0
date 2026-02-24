package org.yug.backend.dto.post;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostStatsDto {
    private UUID postId;
    private Long likesCount;
    private Long commentsCount;
    private Long bookmarksCount;
    private Long reportsCount;
    private Long viewsCount;
}
