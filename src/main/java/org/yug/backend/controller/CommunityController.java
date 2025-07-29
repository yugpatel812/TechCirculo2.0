// src/main/java/org/yug/backend/controller/CommunityController.java
package org.yug.backend.controller;

import jakarta.validation.Valid;
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
@RequestMapping("/communities") // Base path for community APIs
public class CommunityController {

    @Autowired
    private CommunityService communityService;

    // API: GET /communities/all
    @GetMapping("/all")
    public ResponseEntity<List<CommunityDto>> getAllCommunities() {
        List<CommunityDto> communities = communityService.getAllCommunities();
        return ResponseEntity.ok(communities);
    }

    // API: GET /user/communities/joined (from profile.js, but related to communities)
    // This is handled in CommunityService for getting joined communities, might be better under /user path, but for now matching `community.js` structure
    @GetMapping("/user/communities/joined") // Although in community.js it's fetched from a different path
    public ResponseEntity<List<CommunityDto>> getJoinedCommunities(@AuthenticationPrincipal UserDetails userDetails) {
        List<CommunityDto> joinedCommunities = communityService.getJoinedCommunities(userDetails.getUsername());
        return ResponseEntity.ok(joinedCommunities);
    }

    // API: POST /user/communities/join
    @PostMapping("/user/communities/join")
    public ResponseEntity<Void> joinCommunity(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JoinCommunityRequest request) {
        communityService.joinCommunity(userDetails.getUsername(), request.getCommunityId());
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

    // API: POST /communities/{communityId}/posts
    @PostMapping("/{communityId}/posts")
    public ResponseEntity<CommunityPostDto> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID communityId,
            @Valid @RequestBody PostCreateRequest request) {
        CommunityPostDto newPost = communityService.createPost(userDetails.getUsername(), communityId, request);
        return new ResponseEntity<>(newPost, HttpStatus.CREATED);
    }

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

    // API: GET /communities/search?name={communityName} (from profile.js for joining new community)
    // This is implicitly handled by the service and the JoinCommunity API above.
    // If a dedicated search endpoint for names is needed, you would add it here:
    @GetMapping("/search")
    public ResponseEntity<List<CommunityDto>> searchCommunitiesByName(@RequestParam String name) {
        // This would require a new method in CommunityService like:
        // List<CommunityDto> communities = communityService.searchCommunities(name);
        // For now, let's assume `profile.js`'s search is just to find ONE by name for joining.
        // The `joinCommunity` method handles finding the community by ID after a potential frontend search.
        // A dedicated search method in service and controller would look like this:
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
}