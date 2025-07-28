// src/main/java/org/yug/backend/service/ProfileService.java
package org.yug.backend.service.profile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yug.backend.dto.profile.ProfileRequest;
import org.yug.backend.dto.profile.ProfileResponse;
import org.yug.backend.dto.profile.SocialLinksRequest;
import org.yug.backend.model.Profile;
import org.yug.backend.model.auth.User;
import org.yug.backend.repository.ProfileRepository;
import org.yug.backend.repository.UserRepository;
import org.yug.backend.service.JwtService;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private JwtService jwtService; // To extract username from token

    @Transactional(readOnly = true)
    public ProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username);


        Profile profile = user.getProfile(); // Assuming Profile is eagerly fetched or accessible
        if (profile == null) {
            // If a profile doesn't exist, create a new one with default values
            profile = new Profile(user);
            profile.setName(user.getUsername()); // Set name from username initially
            profileRepository.save(profile);
        }

        return ProfileResponse.builder()
                .name(profile.getName())
                .email(user.getEmail()) // Email from User entity
                .university(profile.getUniversity())
                .profilePic(profile.getProfilePicUrl())
                .socialLinks(ProfileResponse.SocialLinks.builder()
                        .linkedin(profile.getLinkedinUrl())
                        .github(profile.getGithubUrl())
                        .leetcode(profile.getLeetcodeUrl())
                        .build())
                .build();
    }

    @Transactional
    public ProfileResponse updatePersonalInfo(String username, ProfileRequest request) {
        User user = userRepository.findByUsername(username);


        Profile profile = user.getProfile();
        if (profile == null) {
            profile = new Profile(user);
        }

        profile.setName(request.getName());
        profile.setUniversity(request.getUniversity());
        profile.setProfilePicUrl(request.getProfilePic());

        profileRepository.save(profile); // Save changes to the profile

        return ProfileResponse.builder()
                .name(profile.getName())
                .email(user.getEmail())
                .university(profile.getUniversity())
                .profilePic(profile.getProfilePicUrl())
                .socialLinks(ProfileResponse.SocialLinks.builder()
                        .linkedin(profile.getLinkedinUrl())
                        .github(profile.getGithubUrl())
                        .leetcode(profile.getLeetcodeUrl())
                        .build())
                .build();
    }

    @Transactional
    public ProfileResponse updateSocialLinks(String username, SocialLinksRequest request) {
        User user = userRepository.findByUsername(username);


        Profile profile = user.getProfile();
        if (profile == null) {
            profile = new Profile(user);
        }

        profile.setLinkedinUrl(request.getLinkedin());
        profile.setGithubUrl(request.getGithub());
        profile.setLeetcodeUrl(request.getLeetcode());

        profileRepository.save(profile); // Save changes to the profile

        return ProfileResponse.builder()
                .name(profile.getName())
                .email(user.getEmail())
                .university(profile.getUniversity())
                .profilePic(profile.getProfilePicUrl())
                .socialLinks(ProfileResponse.SocialLinks.builder()
                        .linkedin(profile.getLinkedinUrl())
                        .github(profile.getGithubUrl())
                        .leetcode(profile.getLeetcodeUrl())
                        .build())
                .build();
    }
}