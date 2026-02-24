package org.yug.backend.mapper;

import org.yug.backend.dto.profile.ProfileResponse;
import org.yug.backend.model.Profile;

public class ProfileMapper {
    public static ProfileResponse toResponse(Profile profile) {
        return ProfileResponse.builder()
                .name(profile.getName())
                .email(profile.getEmail())
                .university(profile.getUniversity())
                .major(profile.getMajor())
                .location(profile.getLocation())
                .bio(profile.getBio())
                .profilePicUrl(profile.getProfilePicUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .leetcodeUrl(profile.getLeetcodeUrl())
                .role(profile.getUser() != null ? profile.getUser().getRole().name() : null)
                .build();
    }
}
