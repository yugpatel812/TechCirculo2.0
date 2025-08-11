// src/main/java/org/yug/backend/dto/community/JoinCommunityRequest.java
package org.yug.backend.dto.community;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class JoinCommunityRequest {
    @NotNull(message = "Community ID is required")
    private UUID communityId;
}