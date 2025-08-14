package org.yug.backend.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.yug.backend.dto.community.CommunityPostDto;
import org.yug.backend.dto.post.PostCreateRequest;
import org.yug.backend.dto.post.PostDto;
import org.yug.backend.service.PostService;
import org.yug.backend.service.community.CommunityService;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private static final Logger logger = LoggerFactory.getLogger(CommunityService.class);

    private final PostService postService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Void> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("communities") String communitiesJson,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        // Manually deserialize the communities JSON string into a List of UUIDs
        ObjectMapper objectMapper = new ObjectMapper();
        List<UUID> communityIds = objectMapper.readValue(communitiesJson, new TypeReference<List<UUID>>() {
        });

        // Manually create the PostCreateRequest DTO
        PostCreateRequest request = new PostCreateRequest();
        request.setCommunityIds(communityIds);
        request.setTitle(title);
        request.setContent(content);
        // The image file would be handled here if you were implementing the upload logic

        // Call the service with the manually created request object
        postService.createPost(userDetails.getUsername(), request);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PostDto>> getAllPosts() {
        List<PostDto> posts = postService.getAllPosts();
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    @GetMapping("/user")
    public ResponseEntity<List<PostService.PostTitleDto>> getUserPosts(@AuthenticationPrincipal UserDetails userDetails) {
        List<PostService.PostTitleDto> userPosts = postService.getUserPosts(userDetails.getUsername());
        return new ResponseEntity<>(userPosts, HttpStatus.OK);
    }
}