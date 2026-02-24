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
public class CommunityMemberDto {
    private UUID id;
    private String username;
    private String email;
    private String role;         // role from UserCommunity
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
