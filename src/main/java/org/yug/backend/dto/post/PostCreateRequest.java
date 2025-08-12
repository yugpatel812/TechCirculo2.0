package org.yug.backend.dto.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class PostCreateRequest {
    @NotNull @Size(min = 1)
    private List<UUID> communityIds;

    @NotBlank @Size(max = 255)
    private String title;

    @NotBlank @Size(max = 5000)
    private String content;

    private String imageUrl;
}
