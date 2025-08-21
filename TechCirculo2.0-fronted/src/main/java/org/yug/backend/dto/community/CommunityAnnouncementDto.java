package org.yug.backend.dto.community;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityAnnouncementDto {
    private UUID id;
    private String title;
    private String content;
    private String authorName;
    private LocalDateTime createdAt;
}
