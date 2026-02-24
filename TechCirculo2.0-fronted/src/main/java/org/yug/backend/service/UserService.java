package org.yug.backend.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.yug.backend.dto.profile.UserProfileDto;
import org.yug.backend.mapper.UserMapper;
import org.yug.backend.model.auth.User;
import org.yug.backend.repository.UserRepository;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public User saveUser(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return repo.save(user);
    }

    public UserProfileDto getUserProfile(UUID id) {
        User user = repo.findByIdWithProfile(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserMapper.toUserProfileDto(user);
    }
}
