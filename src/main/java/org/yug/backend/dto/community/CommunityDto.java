// src/main/java/org/yug/backend/dto/community/CommunityDto.java
package org.yug.backend.dto.community;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CommunityDto {
    private UUID id;
    private String name;
    private String description;
    private String imageUrl;
    private Integer memberCount;
}