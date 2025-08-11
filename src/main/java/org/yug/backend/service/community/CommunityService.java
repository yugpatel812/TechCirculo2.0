// src/main/java/org/yug/backend/service/community/CommunityService.java
package org.yug.backend.service.community;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yug.backend.dto.community.*;
import org.yug.backend.model.*;
import org.yug.backend.model.auth.User;
import org.yug.backend.repository.*;
import jakarta.persistence.EntityNotFoundException;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommunityService {
    private static final Logger logger = LoggerFactory.getLogger(CommunityService.class);

    @Autowired
    private CommunityRepository communityRepository;
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private AnnouncementRepository announcementRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserCommunityRepository userCommunityRepository;

    @Transactional(readOnly = true)
    public List<CommunityDto> getAllCommunities() {
        try {
            logger.info("Fetching all communities");
            List<Community> communities = communityRepository.findAll();

            if (communities == null || communities.isEmpty()) {
                logger.info("No communities found");
                return Collections.emptyList();
            }

            return communities.stream()
                    .filter(Objects::nonNull)
                    .map(community -> {
                        try {
                            return CommunityDto.builder()
                                    .id(community.getId())
                                    .name(community.getName())
                                    .description(community.getDescription())
                                    .imageUrl(community.getImageUrl())
                                    .memberCount(community.getUserCommunities() != null ? community.getUserCommunities().size() : 0L)
                                    .build();
                        } catch (Exception e) {
                            logger.error("Error mapping community: {}", e.getMessage());
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching communities: {}", e.getMessage());
            throw new RuntimeException("Error fetching communities", e);
        }
    }
    @Transactional(readOnly = true)
    public List<CommunityDto> getJoinedCommunities(String username) {
        logger.info("Fetching joined communities for user: {}", username);

        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        // Get all UserCommunity entries for this user
        List<UserCommunity> memberships = userCommunityRepository.findByUserId(user.getId());

        // Extract community IDs
        List<UUID> communityIds = memberships.stream()
                .map(UserCommunity::getCommunityId)
                .collect(Collectors.toList());

        // Fetch all communities at once
        List<Community> communities = communityRepository.findAllById(communityIds);

        // Map to DTOs
        return communities.stream()
                .map(community -> CommunityDto.builder()
                        .id(community.getId())
                        .name(community.getName())
                        .description(community.getDescription())
                        .imageUrl(community.getImageUrl())
                        .memberCount(community.getMemberCount()) // Use the pre-calculated count
                        .build())
                .collect(Collectors.toList());
    }


    @Transactional
    public void joinCommunity(String username, UUID communityId) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community not found"));

        if (userCommunityRepository.existsByUserIdAndCommunityId(user.getId(), communityId)) {
            throw new IllegalStateException("User already a member");
        }

        UserCommunity userCommunity = new UserCommunity();
        userCommunity.setUserId(user.getId());
        userCommunity.setCommunityId(communityId);

        // Set relationships without triggering hashCode/equals
        userCommunity.setUser(user);
        userCommunity.setCommunity(community);
        logger.info("User {} joining community {}", username, communityId);
        userCommunityRepository.save(userCommunity);
        logger.info("User {} successfully joined community {}", username, communityId);
        // Update count without loading all relationships
        community.setMemberCount(userCommunityRepository.countByCommunityId(communityId));
        logger.info("Updating member count for community {}", communityId);
        communityRepository.save(community);
        logger.info("User {} joined community {}", username, communityId);
    }

    @Transactional
    public void leaveCommunity(String username, UUID communityId) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community not found with ID: " + communityId));

        UserCommunity userCommunity = userCommunityRepository.findByUserIdAndCommunityId(user.getId(), communityId)
                .orElseThrow(() -> new IllegalStateException("User is not a member of this community."));

        // Update both sides of the relationship before deletion
        user.getUserCommunities().remove(userCommunity);
        community.getUserCommunities().remove(userCommunity);
        community.setMemberCount((long) community.getUserCommunities().size());

        userCommunityRepository.delete(userCommunity);
        logger.info("User {} left community {}", username, communityId);
    }

    // --- Posts within a Community ---
    @Transactional(readOnly = true)
    public List<CommunityPostDto> getPostsByCommunity(UUID communityId) {
        if (!communityRepository.existsById(communityId)) {
            throw new EntityNotFoundException("Community not found with ID: " + communityId);
        }

        // Calling the updated repository method
        return postRepository.findPostsByCommunityId(communityId).stream()
                .map(post -> CommunityPostDto.builder()
                        .id(post.getId())
                        .title(post.getTitle())
                        .content(post.getContent())
                        .imageUrl(post.getImageUrl())
                        .likesCount(post.getLikesCount())
                        .authorName(post.getAuthor() != null ? post.getAuthor().getUsername() : "Unknown")
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public CommunityPostDto createPost(String username, PostCreateRequest request) {
        User author = userRepository.findByUsername(username);
        if (author == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        if (request.getCommunityIds() == null || request.getCommunityIds().isEmpty()) {
            throw new IllegalArgumentException("At least one community ID is required.");
        }

        logger.info("User {} attempting to create a post in communities {}", username, request.getCommunityIds());

        // Verify all communities exist
        List<Community> communities = communityRepository.findAllById(request.getCommunityIds());
        if (communities.size() != request.getCommunityIds().size()) {
            throw new EntityNotFoundException("One or more communities not found.");
        }

        // Verify user is member of all communities
        for (Community community : communities) {
            if (!userCommunityRepository.existsByUserIdAndCommunityId(author.getId(), community.getId())) {
                throw new IllegalStateException(
                        String.format("User must be a member to post in community %s", community.getName())
                );
            }
        }

        // Create the post
        Post newPost = new Post();
        newPost.setTitle(request.getTitle());
        newPost.setContent(request.getContent());
        newPost.setImageUrl(request.getImageUrl());
        newPost.setAuthor(author);

        // First save the post to generate ID
        Post savedPost = postRepository.save(newPost);
        logger.info("Post saved with ID: {}", savedPost.getId());
        for (UUID communityId : request.getCommunityIds()) {
            postRepository.addPostToCommunity(savedPost.getId(), communityId);
        }

        return CommunityPostDto.builder()
                .id(savedPost.getId())
                .title(savedPost.getTitle())
                .content(savedPost.getContent())
                .imageUrl(savedPost.getImageUrl())
                .likesCount(savedPost.getLikesCount())
                .authorName(savedPost.getAuthor().getUsername())
                .build();
    }
    // --- Announcements within a Community ---
    @Transactional(readOnly = true)
    public List<CommunityAnnouncementDto> getAnnouncementsByCommunity(UUID communityId) {
        if (!communityRepository.existsById(communityId)) {
            throw new EntityNotFoundException("Community not found with ID: " + communityId);
        }

        return announcementRepository.findByCommunityId(communityId).stream()
                .map(announcement -> CommunityAnnouncementDto.builder()
                        .id(announcement.getId())
                        .title(announcement.getTitle())
                        .content(announcement.getContent())
                        .type(announcement.getType())
                        .build())
                .collect(Collectors.toList());
    }

    // --- Members of a Community ---
    @Transactional(readOnly = true)
    public List<CommunityMemberDto> getMembersByCommunity(UUID communityId) {
        if (!communityRepository.existsById(communityId)) {
            throw new EntityNotFoundException("Community not found with ID: " + communityId);
        }

        return userCommunityRepository.findByCommunityId(communityId).stream()
                .map(UserCommunity::getUser)
                .map(user -> CommunityMemberDto.builder()
                        .userId(user.getId())
                        .name(user.getProfile() != null ? user.getProfile().getName() : user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommunityDto> findCommunitiesByName(String name) {
        return communityRepository.findByNameContainingIgnoreCase(name).stream()
                .map(community -> CommunityDto.builder()
                        .id(community.getId())
                        .name(community.getName())
                        .description(community.getDescription())
                        .imageUrl(community.getImageUrl())
                        .memberCount((long) community.getUserCommunities().size())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public CommunityDto createCommunity(CommunityDto req) {
        Community community = new Community();
        community.setName(req.getName());
        community.setDescription(req.getDescription());
        community.setImageUrl(req.getImageUrl());

        Community savedCommunity = communityRepository.save(community);
        return CommunityDto.builder()
                .id(savedCommunity.getId())
                .name(savedCommunity.getName())
                .description(savedCommunity.getDescription())
                .imageUrl(savedCommunity.getImageUrl())
                .memberCount(0L) // New community has 0 members initially
                .build();
    }
}