// src/main/java/org/yug/backend/dto/community/CommunityPostDto.java
package org.yug.backend.dto.community;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CommunityPostDto {
    private UUID id;
    private String title;
    private String content;
    private String imageUrl;
    private Integer likesCount;
    private String authorName; // Display author's name
}