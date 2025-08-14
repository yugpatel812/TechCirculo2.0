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
        user.setRole(User.UserRole.STUDENT);

        Profile profile = new Profile(user);
        profile.setName(request.getUsername());

        user.setProfile(profile);
        userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        logger.info("Logging in user with email: {}", request.getEmail());

        // Authenticate using email and password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        logger.info("Authentication successful for user: {}", request.getEmail());
        if (authentication.isAuthenticated()) {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found!"));
            String token = jwtService.generateToken(user.getUsername());
            return new AuthResponse(token);
        }

        throw new RuntimeException("Login failed: Invalid credentials");
    }
}