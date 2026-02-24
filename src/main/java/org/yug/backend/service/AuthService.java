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
import org.yug.backend.model.Profile;
import org.yug.backend.repository.UserRepository;

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
        user.setRole(request.getRole()); // Convert string to User.UserRole enum

        // Initialize and link the Profile
        Profile profile = new Profile(user);
        profile.setName(request.getUsername());
        user.setProfile(profile);

        userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        logger.info("Logging in user with email: {}", request.getEmail());

        try {
            // Convert string role to User.UserRole enum for validation
            User.UserRole userRole = User.UserRole.valueOf(request.getRole().toUpperCase());
            logger.info("Role validation successful: {}", userRole);

            // Find user first to validate role
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

            // Validate role matches
            if (!user.getRole().equals(userRole)) {
                throw new RuntimeException("Invalid role for user");
            }

            // Authenticate with email and password
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            if (authentication.isAuthenticated()) {
                logger.info("Authentication successful for user: {}", request.getEmail());
                String token = jwtService.generateToken(user.getUsername());
                return new AuthResponse(token);
            } else {
                throw new RuntimeException("Authentication failed");
            }

        } catch (IllegalArgumentException e) {
            logger.error("Invalid role provided: {}", request.getRole());
            throw new RuntimeException("Invalid role: " + request.getRole());
        } catch (Exception e) {
            logger.error("Login failed for user: {}, Error: {}", request.getEmail(), e.getMessage());
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }
}