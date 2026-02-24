// 3. UPDATE CommunityController.java - Use new service methods
package org.yug.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.yug.backend.dto.community.*;
import org.yug.backend.dto.post.PostCreateRequest;
import org.yug.backend.service.community.CommunityService;
import org.yug.backend.service.profile.FileStorageService;
import org.yug.backend.model.auth.User;
import org.yug.backend.repository.UserRepository;
// Add these imports to your CommunityController.java

import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.io.IOException;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/communities")
public class CommunityController {

    @Autowired
    private CommunityService communityService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(CommunityController.class);

    // ✅ UPDATED - Get all communities with join status
    @GetMapping("/all")
    public ResponseEntity<List<CommunityDto>> getAllCommunities(@AuthenticationPrincipal UserDetails userDetails) {
        logger.info("Fetching all communities");
        
        if (userDetails != null) {
            // User is logged in - get communities with join status
            User user = userRepository.findByUsername(userDetails.getUsername());
            if (user != null) {
                List<CommunityDto> communities = communityService.getAllCommunities(user.getId());
                return ResponseEntity.ok(communities);
            }
        }
        
        // User not logged in - get communities without join status
        List<CommunityDto> communities = communityService.getAllCommunities();
        return ResponseEntity.ok(communities);
    }

    @GetMapping("/join")
    public ResponseEntity<?> getJoinedCommunities(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername());
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "User not found"
            ));
        }

        UUID userId = user.getId();
        List<CommunityDto> joinedCommunities = communityService.getJoinedCommunities(userId);
        return ResponseEntity.ok(joinedCommunities);
    }

    // ✅ FIXED - Change endpoint to match frontend
    @PostMapping("/join")  
    public ResponseEntity<?> joinCommunity(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JoinCommunityRequest request) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername());
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "User not found"
                ));
            }

            UUID userId = user.getId(); 
            communityService.joinCommunity(userId, request.getCommunityId());

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "communityId", request.getCommunityId(),
                    "message", "Joined community successfully"
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/leave/{communityId}")
    public ResponseEntity<?> leaveCommunity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID communityId) {

        User user = userRepository.findByUsername(userDetails.getUsername());
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "User not found"
            ));
        }

        UUID userId = user.getId();
        communityService.leaveCommunity(userId, communityId);
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Left community successfully"
        ));
    }

    @GetMapping("/{communityId}/posts")
    public ResponseEntity<List<CommunityPostDto>> getPostsByCommunity(@PathVariable UUID communityId) {
        List<CommunityPostDto> posts = communityService.getPostsByCommunity(communityId);
        return ResponseEntity.ok(posts);
    }

    @PostMapping(value = "/{communityId}/posts", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
public ResponseEntity<?> createPost(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable UUID communityId,
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        @RequestParam(value = "communities", required = false) String communitiesJson,
        @RequestParam(value = "image", required = false) MultipartFile image) {

    try {
        logger.info("Creating post for community: {} with title: {}", communityId, title);
        
        User user = userRepository.findByUsername(userDetails.getUsername());
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "User not found"
            ));
        }

        // Validate input
        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error", 
                "message", "Title is required"
            ));
        }

        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Content is required"
            ));
        }

        // Handle image upload if present
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.saveFile(image, "posts");
            logger.info("Image saved with URL: {}", imageUrl);
        }
        
        // Create PostCreateRequest
        PostCreateRequest request = new PostCreateRequest(
            title.trim(), 
            content.trim(), 
            imageUrl,
            null
        );

        UUID userId = user.getId();
        CommunityPostDto newPost = communityService.createPost(userId, communityId, request);
        
        logger.info("Post created successfully with ID: {}", newPost.getId());
        
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Post created successfully",
            "post", newPost
        ));
        
    } catch (IllegalArgumentException e) {
        logger.error("Invalid argument: ", e);
        return ResponseEntity.badRequest().body(Map.of(
            "status", "error",
            "message", e.getMessage()
        ));
    } catch (Exception e) {
        logger.error("Error creating post: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
            "status", "error",
            "message", "An error occurred while creating the post"
        ));
    }
}

    @GetMapping("/{communityId}/announcements")
    public ResponseEntity<List<CommunityAnnouncementDto>> getAnnouncementsByCommunity(@PathVariable UUID communityId) {
        List<CommunityAnnouncementDto> announcements = communityService.getAnnouncementsByCommunity(communityId);
        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/{communityId}/members")
    public ResponseEntity<List<CommunityMemberDto>> getMembersByCommunity(@PathVariable UUID communityId) {
        List<CommunityMemberDto> members = communityService.getMembersByCommunity(communityId);
        return ResponseEntity.ok(members);
    }

    // ✅ UPDATED - Search with join status
    @GetMapping("/search")
    public ResponseEntity<List<CommunityDto>> searchCommunitiesByName(
            @RequestParam String name,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails != null) {
            User user = userRepository.findByUsername(userDetails.getUsername());
            if (user != null) {
                List<CommunityDto> foundCommunities = communityService.findCommunitiesByName(name, user.getId());
                return ResponseEntity.ok(foundCommunities);
            }
        }
        
        List<CommunityDto> foundCommunities = communityService.findCommunitiesByName(name);
        return ResponseEntity.ok(foundCommunities);
    }

    @PostMapping("/create")
    public ResponseEntity<CommunityDto> createCommunity(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CommunityDto request) {
        CommunityDto newCommunity = communityService.createCommunity(request);
        return new ResponseEntity<>(newCommunity, HttpStatus.CREATED);
    }
}