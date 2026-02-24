package org.yug.backend.dto.profile;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileResponse {
    private String name;
    private String email;
    private String university;
    private String major;
    private String location;
    private String bio;
    private String profilePicUrl;
    private String linkedinUrl;
    private String githubUrl;
    private String leetcodeUrl;
    private String role;
}