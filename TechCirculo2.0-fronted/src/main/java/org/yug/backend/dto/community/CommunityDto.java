package org.yug.backend.dto.community;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityDto {
    private UUID id;
    private String name;
    private String description;
    private String imageUrl;
    private Long memberCount;
    private Boolean isJoined; 
}