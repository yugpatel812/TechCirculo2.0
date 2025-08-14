package org.yug.backend.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
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
    public void createPost(String username, PostCreateRequest request) {
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


        } catch (Exception ex) {
            logger.error("Error creating post: {}", ex.getMessage(), ex);
            throw new RuntimeException("Failed to create post: " + ex.getMessage(), ex);
        }
    }


    public List<PostDto> getAllPosts() {
        try {
            List<Post> posts = postRepository.findAll();
            logger.info("Retrieved {} posts", posts.size());

            // Convert to DTOs
            List<PostDto> postDtos = new ArrayList<>();
            for (Post post : posts) {
                PostDto dto = PostDto.builder()
                        .id(post.getId())
                        .title(post.getTitle())
                        .content(post.getContent())
                        .imageUrl(post.getImageUrl())
                        .likesCount(post.getLikesCount())
                        .authorName(post.getAuthor().getUsername())
                        .communityNames(post.getCommunities().stream()
                                .map(Community::getName)
                                .toList())
                        .build();
                postDtos.add(dto);
            }
            return postDtos;
        } catch (Exception ex) {
            logger.error("Error retrieving posts: {}", ex.getMessage(), ex);
            throw new RuntimeException("Failed to retrieve posts: " + ex.getMessage(), ex);
        }
    }
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public class PostTitleDto {
        private String title;
        private String timeAgo;
        private int comments;
    }


    public List<PostTitleDto> getUserPosts(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return Collections.emptyList();
        }

        return user.getPosts().stream()
                .map(post -> new PostTitleDto(
                        post.getTitle(),
                        "Recently", // or real timeAgo later
                        0           // comments count later
                ))
                .toList();
    }

}
