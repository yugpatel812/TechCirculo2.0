package org.yug.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // Import PasswordEncoder
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.yug.backend.model.auth.User;
import org.yug.backend.model.Profile; // Import Profile model

import org.yug.backend.repository.UserRepository;

import java.util.UUID; // Still used for random password generation example

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Inject PasswordEncoder

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // Extract email from OAuth2 response
        String email = oAuth2User.getAttribute("email");
        logger.info("Email from OAuth2: {}", email); //

        // Validate email domain (as per your existing logic)
        if (!email.endsWith("@paruluniversity.ac.in")) { //
            throw new OAuth2AuthenticationException("Invalid email domain");
        }

        // Derive username from email (e.g., remove the domain part) //
        String username = extractUsernameFromEmail(email); //
        logger.info("Derived username: {}", username); //

        // Check if the user already exists in your database
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    logger.info("User not found, creating a new user for OAuth2: {}", email); //

                    // Create a new user if not found
                    User newUser = new User();
                    // Do NOT manually set UUID for newUser; let JPA generate it using @GeneratedValue(strategy = GenerationType.UUID)
                    newUser.setEmail(email);
                    newUser.setUsername(username);
                    newUser.setRole(User.UserRole.STUDENT); // Set default role

                    // --- Security Fix & Profile Creation: ---
                    // Generate a strong random password and hash it for OAuth2 users.
                    // This handles cases where traditional login might still be enabled or password is required.
                    String generatedPassword = UUID.randomUUID().toString(); // Generate a random string
                    newUser.setPassword(passwordEncoder.encode(generatedPassword)); // Hash the generated password

                    // Create and link the Profile for the new User
                    Profile newProfile = new Profile(newUser); // Link the profile to the new user
                    newProfile.setName(oAuth2User.getAttribute("name")); // Attempt to get name from OAuth2 attributes
                    newProfile.setProfilePicUrl(oAuth2User.getAttribute("picture")); // Attempt to get profile picture URL

                    newUser.setProfile(newProfile); // Set the profile on the user entity

                    // Save the new user (cascade will save the profile)
                    User savedUser = userRepository.save(newUser); //
                    logger.info("New user saved: {}", savedUser.getEmail()); //
                    return savedUser;
                });

        logger.info("Loaded or created user: {}", user.getEmail()); //
        return oAuth2User; //
    }

    /**
     * Extracts a username from the email.
     * For example, "john.doe@paruluniversity.ac.in" -> "john.doe"
     */
    private String extractUsernameFromEmail(String email) { //
        if (email == null || !email.contains("@")) { //
            throw new IllegalArgumentException("Invalid email format"); //
        }
        return email.split("@")[0]; //
    }
}