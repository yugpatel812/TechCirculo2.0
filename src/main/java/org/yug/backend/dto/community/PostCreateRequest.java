// src/main/java/org/yug/backend/dto/community/PostCreateRequest.java
package org.yug.backend.dto.community;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class PostCreateRequest {
    @NotNull(message = "Community IDs are required")
    private List<UUID> communityIds;

    @NotBlank(message = "Post title is required")
    private String title;

    @NotBlank(message = "Post content is required")
    private String content;

    private String imageUrl; // Optional
}