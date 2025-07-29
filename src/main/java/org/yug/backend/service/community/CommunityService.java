// src/main/java/org/yug/backend/service/CommunityService.java
package org.yug.backend.service.community;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yug.backend.dto.community.*;
import org.yug.backend.model.*;
import org.yug.backend.model.auth.User;
import org.yug.backend.repository.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import jakarta.persistence.EntityNotFoundException;


import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommunityService {

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

    // --- Community Management ---

    @Transactional(readOnly = true)
    public List<CommunityDto> getAllCommunities() {
        return communityRepository.findAll().stream()
                .map(community -> CommunityDto.builder()
                        .id(community.getId())
                        .name(community.getName())
                        .description(community.getDescription())
                        .imageUrl(community.getImageUrl())
                        .memberCount(community.getUserCommunities().size()) // Dynamically calculate member count
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommunityDto> getJoinedCommunities(String username) {
        User user = userRepository.findByUsername(username);


        return userCommunityRepository.findByUser_Id(user.getId()).stream()
                .map(UserCommunity::getCommunity) // Get the Community object from UserCommunity
                .map(community -> CommunityDto.builder()
                        .id(community.getId())
                        .name(community.getName())
                        .description(community.getDescription())
                        .imageUrl(community.getImageUrl())
                        .memberCount(community.getUserCommunities().size())
                        .build())
                .collect(Collectors.toList());
    }


    // --- Join/Leave Community ---

    @Transactional
    public void joinCommunity(String username, UUID communityId) {
        User user = userRepository.findByUsername(username);


        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community not found with ID: " + communityId));

        if (userCommunityRepository.existsByUser_IdAndCommunity_Id(user.getId(), communityId)) {
            throw new RuntimeException("User already a member of this community.");
        }

        UserCommunity userCommunity = new UserCommunity(user, community);
        userCommunityRepository.save(userCommunity);

        // Update member count in Community entity (bi-directional relationship handling)
        community.addUserCommunity(userCommunity); // This internally updates memberCount
        communityRepository.save(community);
    }

    @Transactional
    public void leaveCommunity(String username, UUID communityId) {
        User user = userRepository.findByUsername(username);


        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community not found with ID: " + communityId));

        UserCommunity userCommunity = userCommunityRepository.findByUser_IdAndCommunity_Id(user.getId(), communityId)
                .orElseThrow(() -> new RuntimeException("User is not a member of this community."));

        userCommunityRepository.delete(userCommunity);

        // Update member count in Community entity (bi-directional relationship handling)
        community.removeUserCommunity(userCommunity); // This internally updates memberCount
        communityRepository.save(community);
    }

    // --- Posts within a Community ---

    @Transactional(readOnly = true)
    public List<CommunityPostDto> getPostsByCommunity(UUID communityId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community not found with ID: " + communityId));

        return postRepository.findByCommunityId(communityId).stream()
                .map(post -> CommunityPostDto.builder()
                        .id(post.getId())
                        .title(post.getTitle())
                        .content(post.getContent())
                        .imageUrl(post.getImageUrl())
                        .likesCount(post.getLikesCount())
                        .authorName(post.getAuthor() != null ? post.getAuthor().getUsername() : "Unknown") // Get author's username
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public CommunityPostDto createPost(String username, UUID communityId, PostCreateRequest request) {
        User author = userRepository.findByUsername(username);


        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community not found with ID: " + communityId));

        // Optional: Add a check if the user is actually a member of the community before allowing them to post
        if (!userCommunityRepository.existsByUser_IdAndCommunity_Id(author.getId(), communityId)) {
            throw new RuntimeException("User must be a member to post in this community.");
        }

        Post newPost = new Post();
        newPost.setTitle(request.getTitle());
        newPost.setContent(request.getContent());
        newPost.setImageUrl(request.getImageUrl());
        newPost.setAuthor(author);
        newPost.setCommunity(community);

        Post savedPost = postRepository.save(newPost);

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
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community not found with ID: " + communityId));

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
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntityNotFoundException("Community not found with ID: " + communityId));

        return userCommunityRepository.findByCommunity_Id(communityId).stream()
                .map(UserCommunity::getUser) // Get the User object from UserCommunity
                .map(user -> CommunityMemberDto.builder()
                        .userId(user.getId())
                        .name(user.getProfile() != null ? user.getProfile().getName() : user.getUsername()) // Prefer profile name, fallback to username
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .build())
                .collect(Collectors.toList());
    }

    // Add this method to your existing CommunityService.java
// src/main/java/org/yug/backend/service/CommunityService.java

    @Transactional(readOnly = true)
    public List<CommunityDto> findCommunitiesByName(String name) {
        return communityRepository.findByNameContainingIgnoreCase(name).stream()
                .map(community -> CommunityDto.builder()
                        .id(community.getId())
                        .name(community.getName())
                        .description(community.getDescription())
                        .imageUrl(community.getImageUrl())
                        .memberCount(community.getUserCommunities().size())
                        .build())
                .collect(Collectors.toList());
    }


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
                .memberCount(savedCommunity.getUserCommunities().size())
                .build();
    }

}