package org.yug.backend.dto.post;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PostDto {
    private UUID id;
    private String title;
    private String content;
    private String imageUrl;
    private Integer likesCount;
    private String authorName;
    private List<String> communityNames;
}