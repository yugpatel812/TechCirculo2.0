// src/main/java/org/yug/backend/controller/ProfileController.java
package org.yug.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.yug.backend.dto.profile.ProfileRequest;
import org.yug.backend.dto.profile.ProfileResponse;
import org.yug.backend.dto.profile.SocialLinksRequest;
import org.yug.backend.service.profile.ProfileService;

@RestController
@RequestMapping("/user") // Base path for user-related APIs
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        // userDetails.getUsername() will provide the username extracted from the JWT token
        ProfileResponse profile = profileService.getUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updatePersonalInfo(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileRequest request) {
        ProfileResponse updatedProfile = profileService.updatePersonalInfo(userDetails.getUsername(), request);
        return ResponseEntity.ok(updatedProfile);
    }

    @PutMapping("/social-links")
    public ResponseEntity<ProfileResponse> updateSocialLinks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SocialLinksRequest request) {
        ProfileResponse updatedProfile = profileService.updateSocialLinks(userDetails.getUsername(), request);
        return ResponseEntity.ok(updatedProfile);
    }
}