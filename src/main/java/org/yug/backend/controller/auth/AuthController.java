package org.yug.backend.controller.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.yug.backend.dto.auth.AuthResponse;
import org.yug.backend.dto.auth.LoginRequest;
import org.yug.backend.dto.auth.RegisterRequest;
import org.yug.backend.service.AuthService;
import org.yug.backend.service.profile.ProfileService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    @Autowired
    private ProfileService profileService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response); // Return JSON response with token
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response); // Return JSON response with token
    }

    // user profile get
     @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
         String username = userDetails.getUsername(); // Extract username from UserDetails
         return ResponseEntity.ok(profileService.getUserProfile(username)); // Return user profile
     }
}