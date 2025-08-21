package org.yug.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.yug.backend.dto.profile.UserProfileDto;
import org.yug.backend.model.Profile;
import org.yug.backend.model.auth.User;
import org.yug.backend.repository.UserRepository;

import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    // ✅ 1. Register / Save User
    public User saveUser(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        System.out.println("Encoded password: " + user.getPassword());
        return repo.save(user);
    }

    // ✅ 2. Fetch User + Profile merged DTO
    public UserProfileDto getUserProfile(UUID id) {
        User user = repo.findByIdWithProfile(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
