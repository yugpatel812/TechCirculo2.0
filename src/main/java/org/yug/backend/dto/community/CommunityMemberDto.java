// src/main/java/org/yug/backend/dto/community/CommunityMemberDto.java
package org.yug.backend.dto.community;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CommunityMemberDto {
    private UUID userId;
    private String name;
    private String email;
    private String role; // e.g., Student, Teacher, Alumni, Admin
}