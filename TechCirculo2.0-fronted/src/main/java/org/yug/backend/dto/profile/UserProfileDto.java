package org.yug.backend.dto.profile;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDto {
    private UUID id;
    private String username;
    private String email;
    private String role;

    private String name;
    private String university;
    private String profilePicUrl;
    private String linkedinUrl;
    private String githubUrl;
    private String leetcodeUrl;
    private String bio;
    private String location;
    private String major;
}
