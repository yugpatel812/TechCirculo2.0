// src/main/java/org/yug/backend/dto/community/CommunityAnnouncementDto.java
package org.yug.backend.dto.community;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CommunityAnnouncementDto {
    private UUID id;
    private String title;
    private String content;
    private String type;
}