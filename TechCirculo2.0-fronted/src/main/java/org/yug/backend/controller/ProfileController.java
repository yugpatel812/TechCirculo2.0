package org.yug.backend.controller;

import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.yug.backend.dto.profile.*;
import org.yug.backend.service.profile.ProfileService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/profile")

@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    @Value("${file.upload-dir}")
    private String uploadDir;

    // ✅ Get logged-in user's profile
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        ProfileResponse response = profileService.getUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    // ✅ Update only personal info (name, university, profilePic)
    @PutMapping("/personal-info")
    public ResponseEntity<ProfileResponse> updatePersonalInfo(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileRequest request) {
        ProfileResponse response = profileService.updatePersonalInfo(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    // ✅ Update only social links (linkedin, github, leetcode)
    @PutMapping("/social-links")
    public ResponseEntity<ProfileResponse> updateSocialLinks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SocialLinksRequest request) {
        ProfileResponse response = profileService.updateSocialLinks(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    // ✅ Upload and update profile picture
@PostMapping(value = "/profile-pic", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> updateProfilePic(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam("file") MultipartFile file,
        HttpServletRequest request) { // <-- inject request to build URL

    String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
    Path uploadPath = Paths.get(uploadDir, "profile-pics");

    try {
        Files.createDirectories(uploadPath); // ensure folder exists
        Path filePath = uploadPath.resolve(fileName);
        file.transferTo(filePath.toFile());

        // ✅ Build full URL using request info
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        String fileUrl =  "/uploads/profile-pics/" + fileName;

        ProfileResponse response = profileService.updateProfilePic(userDetails.getUsername(), fileUrl);

        return ResponseEntity.ok(response);

    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "File upload failed: " + e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Unexpected error: " + e.getMessage()));
    }
}


    // ✅ Update everything at once
    @PutMapping("/full")
    public ResponseEntity<ProfileResponse> updateFullProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileUpdateRequest request) {
        ProfileResponse response = profileService.updateFullProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

}
