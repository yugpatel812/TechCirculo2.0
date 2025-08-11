package org.yug.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.yug.backend.dto.auth.AuthResponse;
import org.yug.backend.dto.auth.LoginRequest;
import org.yug.backend.dto.auth.RegisterRequest;
import org.yug.backend.model.auth.User;
import org.yug.backend.model.Profile; // Import Profile

import org.yug.backend.repository.UserRepository;

// import java.util.UUID; // Not needed if JPA generates UUID

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUsername(request.getUsername());
        user.setRole(User.UserRole.STUDENT); //default role, can be changed later

        // --- CRITICAL ADDITION: Initialize and link the Profile ---
        Profile profile = new Profile(user); // Create a new Profile instance, linking it to the user
        profile.setName(request.getUsername()); // Or initial name from somewhere, e.g., username

        user.setProfile(profile); // Link the profile to the user

        userRepository.save(user); // Now save the user, which will cascade to save the profile

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        logger.info("Logging in user with email: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
logger.info("Authentication successful for user: {}", request.getEmail());
        if (authentication.isAuthenticated()) {
            logger.info("User logged in: {}", request.getEmail());
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found!"));
            logger.info("User logged in: {}", request.getEmail());
            String token = jwtService.generateToken(user.getUsername());
            return new AuthResponse(token);
        }

        throw new RuntimeException("Login failed: Invalid credentials");
    }
}