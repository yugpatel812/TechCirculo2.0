package org.yug.backend.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.yug.backend.service.JwtService;


import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
        private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);
    @Autowired
    private JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
logger.info("OAuth2 User: "+oAuth2User);
        // Extract email from Google OAuth2 response
        String email = oAuth2User.getAttribute("email");

        // Derive username from email (e.g., remove the domain part)
        String username = extractUsernameFromEmail(email);

        // Generate the JWT token using the username
        String token = jwtService.generateToken(username);

        // Set the response content type to JSON
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Redirect to the frontend with the token as a query parameter
        String redirectUrl = "http://localhost:8084/dashboard.html?token=" + token;
        response.sendRedirect(redirectUrl);
    }

    /**
     * Extracts a username from the email.
     * For example, "john.doe@paruluniversity.ac.in" -> "john.doe"
     */
    private String extractUsernameFromEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email format");
        }
        return email.split("@")[0]; // Extract the part before the '@' symbol
    }
}

//package org.yug.backend.config;
//
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
//import org.springframework.stereotype.Component;
//import org.yug.backend.service.CustomOAuth2UserService;
//import org.yug.backend.service.JwtService;
//
//import java.io.IOException;
//
//@Component
//public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
//    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);
//    @Autowired
//    private JwtService jwtService;
//
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
//        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
//logger.info("OAuth2 User: "+oAuth2User);
//        // Extract email from Google OAuth2 response
//        String email = oAuth2User.getAttribute("email");
//
//        // Derive username from email (e.g., remove the domain part)
//        String username = extractUsernameFromEmail(email);
//
//        // Generate the JWT token using the username
//        String token = jwtService.generateToken(username);
//
//        // Redirect to the frontend with the token as a query parameter
//        String redirectUrl = "http://localhost:5173?token=" + token; // Replace with your frontend URL
//        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
//    }
//
//    /**
//     * Extracts a username from the email.
//     * For example, "john.doe@paruluniversity.ac.in" -> "john.doe"
//     */
//    private String extractUsernameFromEmail(String email) {
//        if (email == null || !email.contains("@")) {
//            throw new IllegalArgumentException("Invalid email format");
//        }
//        return email.split("@")[0]; // Extract the part before the '@' symbol
//    }
//}