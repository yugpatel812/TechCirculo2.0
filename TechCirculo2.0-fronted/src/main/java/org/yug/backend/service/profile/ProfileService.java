package org.yug.backend.service.profile;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.yug.backend.dto.profile.*;
import org.yug.backend.model.Profile;
import org.yug.backend.model.auth.User;
import org.yug.backend.repository.ProfileRepository;
import org.yug.backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    private Profile getOrCreateProfile(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        return profileRepository.findByUser_Username(username)
                .orElseGet(() -> {
                    Profile newProfile = new Profile();
                    newProfile.setUser(user);
                    // Set email from User entity as default
                    newProfile.setEmail(user.getEmail());
                    return profileRepository.save(newProfile);
                });
    }

    public ProfileResponse getUserProfile(String username) {
        Profile profile = getOrCreateProfile(username);
        return mapToResponse(profile);
    }

    @Transactional
    public ProfileResponse updatePersonalInfo(String username, ProfileRequest request) {
        Profile profile = getOrCreateProfile(username);

        if (request.getName() != null) profile.setName(request.getName());
        if (request.getEmail() != null) profile.setEmail(request.getEmail());
        if (request.getUniversity() != null) profile.setUniversity(request.getUniversity());
        if (request.getMajor() != null) profile.setMajor(request.getMajor());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getProfilePicUrl() != null) profile.setProfilePicUrl(request.getProfilePicUrl());

        profileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public ProfileResponse updateSocialLinks(String username, SocialLinksRequest request) {
        Profile profile = getOrCreateProfile(username);

        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getLeetcodeUrl() != null) profile.setLeetcodeUrl(request.getLeetcodeUrl());

        profileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public ProfileResponse updateProfilePic(String username, String fileUrl) {
        Profile profile = getOrCreateProfile(username);
        profile.setProfilePicUrl(fileUrl);
        profileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public ProfileResponse updateFullProfile(String username, ProfileUpdateRequest request) {
        Profile profile = getOrCreateProfile(username);

        if (request.getName() != null) profile.setName(request.getName());
        if (request.getEmail() != null) profile.setEmail(request.getEmail());
        if (request.getUniversity() != null) profile.setUniversity(request.getUniversity());
        if (request.getMajor() != null) profile.setMajor(request.getMajor());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getProfilePicUrl() != null) profile.setProfilePicUrl(request.getProfilePicUrl());

        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getLeetcodeUrl() != null) profile.setLeetcodeUrl(request.getLeetcodeUrl());

        profileRepository.save(profile);
        return mapToResponse(profile);
    }

    private ProfileResponse mapToResponse(Profile profile) {
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