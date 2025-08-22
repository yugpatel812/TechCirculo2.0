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
public class CommunityDto {
    private UUID id;
    private String name;
    private String description;
    private String imageUrl;
    private Long memberCount;
    private Boolean isJoined; 

    private String role;           // from user_communities
    private LocalDateTime joinedAt; // from user_communities
   
}