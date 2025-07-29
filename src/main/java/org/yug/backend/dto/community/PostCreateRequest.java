// src/main/java/org/yug/backend/dto/community/PostCreateRequest.java
package org.yug.backend.dto.community;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PostCreateRequest {
    @NotBlank(message = "Post title is required")
    private String title;
    @NotBlank(message = "Post content is required")
    private String content;
    private String imageUrl; // Optional
}