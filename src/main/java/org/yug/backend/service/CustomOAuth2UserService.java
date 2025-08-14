// src/main/java/org/yug/backend/service/CustomOAuth2UserService.java
package org.yug.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.yug.backend.model.auth.User;
import org.yug.backend.model.Profile;
import org.yug.backend.repository.UserRepository;

import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        if (email == null || !email.endsWith("@paruluniversity.ac.in")) {
            throw new OAuth2AuthenticationException("Invalid email domain or missing email attribute");
        }

        userRepository.findByEmail(email)
                .ifPresentOrElse(
                        user -> logger.info("User already exists, no action needed for: {}", email),
                        () -> {
                            logger.info("User not found, creating a new user for OAuth2: {}", email);
                            User newUser = new User();
                            newUser.setEmail(email);

                            String username = oAuth2User.getAttribute("name");
                            // Ensure username is unique
                            if (userRepository.findByUsername(username) != null) {
                                username = username + UUID.randomUUID().toString().substring(0, 4);
                            }
                            newUser.setUsername(username);
                            newUser.setRole(User.UserRole.STUDENT);
                            newUser.setPassword(UUID.randomUUID().toString());

                            Profile newProfile = new Profile(newUser);
                            newProfile.setName(oAuth2User.getAttribute("name"));
                            newProfile.setProfilePicUrl(oAuth2User.getAttribute("picture"));
                            newUser.setProfile(newProfile);

                            userRepository.save(newUser);
                            logger.info("New user saved: {}", newUser.getEmail());
                        }
                );

        return oAuth2User;
    }
}