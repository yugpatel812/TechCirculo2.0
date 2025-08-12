package org.yug.backend.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.yug.backend.dto.post.PostCreateRequest;
import org.yug.backend.dto.post.PostDto;
import org.yug.backend.service.PostService;
import org.yug.backend.service.community.CommunityService;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private static final Logger logger = LoggerFactory.getLogger(CommunityService.class);

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostDto> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PostCreateRequest request) {
        logger.info(request.toString());
        PostDto createdPost = postService.createPost(userDetails.getUsername(), request);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }
}