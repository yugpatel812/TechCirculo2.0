//profileRequest.java
package org.yug.backend.dto.profile;

import lombok.Data;

@Data
public class ProfileRequest {
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
}
