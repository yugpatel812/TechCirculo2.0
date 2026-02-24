package org.yug.backend.mapper;

import org.yug.backend.dto.profile.UserProfileDto;
import org.yug.backend.model.Profile;
import org.yug.backend.model.auth.User;

public class UserMapper {
    public static UserProfileDto toUserProfileDto(User user) {
        Profile profile = user.getProfile();
        return new UserProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().toString(),
                profile != null ? profile.getName() : null,
                profile != null ? profile.getUniversity() : null,
                profile != null ? profile.getProfilePicUrl() : null,
                profile != null ? profile.getLinkedinUrl() : null,
                profile != null ? profile.getGithubUrl() : null,
                profile != null ? profile.getLeetcodeUrl() : null,
                profile != null ? profile.getBio() : null,
                profile != null ? profile.getLocation() : null,
                profile != null ? profile.getMajor() : null
        );
    }
}
