package org.yug.backend.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yug.backend.dto.post.PostCreateRequest;
import org.yug.backend.dto.post.PostDto;
import org.yug.backend.model.*;
import org.yug.backend.model.auth.User;
import org.yug.backend.repository.*;

import java.util.*;
@Service
@RequiredArgsConstructor
public class PostService {
    private static final Logger logger = LoggerFactory.getLogger(PostService.class);

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final UserCommunityRepository userCommunityRepository;

    @Transactional
    public PostDto createPost(String username, PostCreateRequest request) {
        try {
            // 1. Verify user exists
            User author = userRepository.findByUsername(username);
            logger.info("Creating post for user: {}", author.getUsername());

            // 2. Create new post instance
            Post post = new Post();
            post.setTitle(request.getTitle());
            post.setContent(request.getContent());
            post.setImageUrl(request.getImageUrl());
            post.setAuthor(author);
logger.info("Post created with title: {}", post.getTitle());
            // 3. Process communities safely
            Set<Community> communities = new LinkedHashSet<>();
            for (UUID communityId : request.getCommunityIds()) {
                Community community = communityRepository.findById(communityId)
                        .orElseThrow(() -> new IllegalArgumentException("Community not found: " + communityId));

                if (!userCommunityRepository.existsByUserIdAndCommunityId(author.getId(), communityId)) {
                    throw new IllegalStateException("User must be member of community: " + communityId);
                }
                communities.add(community);
            }

            // 4. Associate communities using helper methods
            for (Community community : communities) {
                post.addCommunity(community);
            }

            // 5. Save and return
            Post savedPost = postRepository.save(post);
            logger.info("Created post {} in communities {}",
                    savedPost.getId(), savedPost.getCommunities().size());

            return toDto(savedPost);
        } catch (Exception ex) {
            logger.error("Error creating post: {}", ex.getMessage(), ex);
            throw new RuntimeException("Failed to create post: " + ex.getMessage(), ex);
        }
    }

    private PostDto toDto(Post post) {
        return PostDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .likesCount(post.getLikesCount())
                .authorName(post.getAuthor().getUsername())
                .communityIds(post.getCommunities().stream()
                        .map(Community::getId)
                        .toList())
                .build();
    }
}