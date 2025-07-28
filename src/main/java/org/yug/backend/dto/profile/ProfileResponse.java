// src/main/java/org/yug/backend/dto/profile/ProfileResponse.java
package org.yug.backend.dto.profile;

import lombok.Builder;
import lombok.Data;
import org.yug.backend.model.auth.User; // Ensure User model is imported

@Data
@Builder
public class ProfileResponse {
    private String name;
    private String email;
    private String university;
    private String profilePic; // URL
    private SocialLinks socialLinks; // Nested DTO for social links

    @Data
    @Builder
    public static class SocialLinks {
        private String linkedin;
        private String github;
        private String leetcode;
    }
}