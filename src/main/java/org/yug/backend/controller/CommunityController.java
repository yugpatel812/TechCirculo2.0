package org.yug.backend.controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.validation.Valid;
import lombok.extern.flogger.Flogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.yug.backend.dto.community.*;
import org.yug.backend.service.community.CommunityService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/communities")
public class CommunityController {
    @Autowired
    private CommunityService communityService;
    private static final Logger logger = LoggerFactory.getLogger(CommunityController.class);

    // API: GET /communities/all
    @GetMapping("/all")
    public ResponseEntity<List<CommunityDto>> getAllCommunities() {
        logger.info("Fetching all communities");
        List<CommunityDto> communities = communityService.getAllCommunities();
        return ResponseEntity.ok(communities);
    }

    // API: GET /user/communities/joined
    @GetMapping("/user/communities/joined")
    public ResponseEntity<List<CommunityDto>> getJoinedCommunities(@AuthenticationPrincipal UserDetails userDetails) {
        List<CommunityDto> joinedCommunities = communityService.getJoinedCommunities(userDetails.getUsername());
        logger.info("Returning {} communities for user {}", joinedCommunities.size(), userDetails.getUsername());
        joinedCommunities.forEach(c -> logger.info("Community: {}", c));
        return ResponseEntity.ok(joinedCommunities);
    }

    // API: POST /user/communities/join
    @PostMapping("/user/communities/join")
    public ResponseEntity<Void> joinCommunity(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JoinCommunityRequest request) {
        logger.info("User {} attempting to join community {}", userDetails.getUsername(), request.getCommunityId());
        communityService.joinCommunity(userDetails.getUsername(), request.getCommunityId());
        logger.info("User {} joined community {}", userDetails.getUsername(), request.getCommunityId());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    // API: DELETE /user/communities/leave/{communityId}
    @DeleteMapping("/user/communities/leave/{communityId}")
    public ResponseEntity<Void> leaveCommunity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID communityId) {
        communityService.leaveCommunity(userDetails.getUsername(), communityId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    // API: GET /communities/{communityId}/posts
    @GetMapping("/{communityId}/posts")
    public ResponseEntity<List<CommunityPostDto>> getPostsByCommunity(@PathVariable UUID communityId) {
        List<CommunityPostDto> posts = communityService.getPostsByCommunity(communityId);
        return ResponseEntity.ok(posts);
    }

    // API: POST /communities/{communityId}/posts (This endpoint is now removed as per the new design)
    // @PostMapping("/{communityId}/posts")
    // public ResponseEntity<CommunityPostDto> createPost(
    //         @AuthenticationPrincipal UserDetails userDetails,
    //         @PathVariable UUID communityId,
    //         @Valid @RequestBody PostCreateRequest request) {
    //     CommunityPostDto newPost = communityService.createPost(userDetails.getUsername(), communityId, request);
    //     return new ResponseEntity<>(newPost, HttpStatus.CREATED);
    // }

    // API: GET /communities/{communityId}/announcements
    @GetMapping("/{communityId}/announcements")
    public ResponseEntity<List<CommunityAnnouncementDto>> getAnnouncementsByCommunity(@PathVariable UUID communityId) {
        List<CommunityAnnouncementDto> announcements = communityService.getAnnouncementsByCommunity(communityId);
        return ResponseEntity.ok(announcements);
    }

    // API: GET /communities/{communityId}/members
    @GetMapping("/{communityId}/members")
    public ResponseEntity<List<CommunityMemberDto>> getMembersByCommunity(@PathVariable UUID communityId) {
        List<CommunityMemberDto> members = communityService.getMembersByCommunity(communityId);
        return ResponseEntity.ok(members);
    }

    // API: GET /communities/search?name={communityName}
    @GetMapping("/search")
    public ResponseEntity<List<CommunityDto>> searchCommunitiesByName(@RequestParam String name) {
        List<CommunityDto> foundCommunities = communityService.findCommunitiesByName(name);
        return ResponseEntity.ok(foundCommunities);
    }

    //create a new community
    @PostMapping("/create")
    public ResponseEntity<CommunityDto> createCommunity(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CommunityDto request) {
        CommunityDto newCommunity = communityService.createCommunity(request);
        return new ResponseEntity<>(newCommunity, HttpStatus.CREATED);
    }


    // posts creation endpoint
    @PostMapping("/posts")
    public ResponseEntity<CommunityPostDto> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PostCreateRequest request) {
        logger.info("User {} creating post", userDetails.getUsername());
        CommunityPostDto newPost = communityService.createPost(userDetails.getUsername(), request);
        return new ResponseEntity<>(newPost, HttpStatus.CREATED);
    }
}