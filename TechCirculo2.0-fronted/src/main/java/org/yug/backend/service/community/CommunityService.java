package org.yug.backend.service.community;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yug.backend.dto.community.*;
import org.yug.backend.dto.post.PostCreateRequest;
import org.yug.backend.dto.profile.UserProfileDto;
import org.yug.backend.model.Community;
import org.yug.backend.model.UserCommunity;
import org.yug.backend.model.auth.User;
import org.yug.backend.model.post.Post;
import org.yug.backend.repository.CommunityRepository;
import org.yug.backend.repository.PostRepository;
import org.yug.backend.repository.UserCommunityRepository;
import org.yug.backend.repository.UserRepository;
import org.yug.backend.service.UserService;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final UserCommunityRepository userCommunityRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final UserService userService; 

    // ✅ Convert Entity to DTO with join status
    private CommunityDto toDto(Community community, UUID currentUserId) {
        boolean isJoined = false;
        if (currentUserId != null) {
            isJoined = userCommunityRepository.existsByUserIdAndCommunityId(currentUserId, community.getId());
        }
        
        return CommunityDto.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .imageUrl(community.getImageUrl())
                .memberCount(community.getMemberCount() != null ? community.getMemberCount() : 0L)
                .isJoined(isJoined)
                .build();
    }

    // ✅ Convert Entity to DTO without user context
    private CommunityDto toDto(Community community) {
        return CommunityDto.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .imageUrl(community.getImageUrl())
                .memberCount(community.getMemberCount() != null ? community.getMemberCount() : 0L)
                .isJoined(false)
                .build();
    }

    // ✅ Convert Post entity to DTO
    private CommunityPostDto toPostDto(Post post) {
        return CommunityPostDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getUsername()) // or getFullName() if you have that field
                .likesCount(post.getLikesCount() != null ? post.getLikesCount() : 0)
                .commentsCount(0) // You can add this field to Post model later if needed
                .build();
    }

    // ✅ Get all communities with join status for specific user
    public List<CommunityDto> getAllCommunities(UUID currentUserId) {
        return communityRepository.findAll()
                .stream()
                .map(community -> toDto(community, currentUserId))
                .collect(Collectors.toList());
    }

    // ✅ Get all communities without user context
    public List<CommunityDto> getAllCommunities() {
        return communityRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ✅ Search communities by name without user context
    public List<CommunityDto> findCommunitiesByName(String name) {
        return communityRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ✅ Search communities by name with join status
    public List<CommunityDto> findCommunitiesByName(String name, UUID currentUserId) {
        return communityRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(community -> toDto(community, currentUserId))
                .collect(Collectors.toList());
    }

    // ✅ Get joined communities
    public List<CommunityDto> getJoinedCommunities(UUID userId) {
        List<UserCommunity> relations = userCommunityRepository.findByUserId(userId);

        return relations.stream()
            .map(rel -> communityRepository.findById(rel.getCommunityId())
                    .map(community -> CommunityDto.builder()
                            .id(community.getId())
                            .name(community.getName())
                            .description(community.getDescription())
                            .imageUrl(community.getImageUrl())
                            .memberCount(community.getMemberCount() != null ? community.getMemberCount() : 0L)
                            .role(rel.getRole() != null ? rel.getRole() : "Member")
                            .joinedAt(rel.getJoinedAt())
                            .build())
                    .orElse(null))
            .filter(c -> c != null)
            .toList();
    }

    // ✅ Create a new community (method overloads)
    public CommunityDto createCommunity(String name, String description, String imageUrl) {
        Community community = new Community(name, description, imageUrl);
        Community saved = communityRepository.save(community);
        return toDto(saved);
    }

    public CommunityDto createCommunity(CommunityDto dto) {
        Community community = new Community(dto.getName(), dto.getDescription(), dto.getImageUrl());
        Community saved = communityRepository.save(community);
        return toDto(saved);
    }

    // ✅ Get community by ID without user context
    public CommunityDto getCommunityById(UUID id) {
        return communityRepository.findById(id)
                .map(this::toDto)
                .orElse(null);
    }

    // ✅ Get community by ID with join status
    public CommunityDto getCommunityById(UUID id, UUID currentUserId) {
        return communityRepository.findById(id)
                .map(community -> toDto(community, currentUserId))
                .orElse(null);
    }

    // ✅ Join community
    @Transactional
    public void joinCommunity(UUID userId, UUID communityId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        if (userCommunityRepository.existsByUserIdAndCommunityId(userId, communityId)) {
            throw new IllegalStateException("User already joined this community");
        }

        UserCommunity relation = UserCommunity.builder()
                .userId(userId)
                .communityId(communityId)
                .role("Member")
                .build();
        userCommunityRepository.save(relation);

        long count = userCommunityRepository.countByCommunityId(communityId);
        community.setMemberCount(count);
        communityRepository.save(community);
    }

    // ✅ Leave community
    @Transactional
    public void leaveCommunity(UUID userId, UUID communityId) {
        UserCommunity relation = userCommunityRepository.findByUserIdAndCommunityId(userId, communityId)
                .orElseThrow(() -> new IllegalArgumentException("User not in community"));

        userCommunityRepository.delete(relation);

        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        long count = userCommunityRepository.countByCommunityId(communityId);
        community.setMemberCount(count);
        communityRepository.save(community);
    }

    // ✅ UPDATED - Get posts by community (now actually fetches from database)
    public List<CommunityPostDto> getPostsByCommunity(UUID communityId) {
        List<Post> posts = postRepository.findByCommunityId(communityId);
        
        return posts.stream()
                .map(this::toPostDto)
                .collect(Collectors.toList());
    }

    // ✅ UPDATED - Create post in community (now actually saves to database)
    @Transactional
    public CommunityPostDto createPost(UUID userId, UUID communityId, PostCreateRequest request) {
        // Validate that community exists
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));
        
        // Validate that user is a member of the community
        boolean isMember = userCommunityRepository.existsByUserIdAndCommunityId(userId, communityId);
        if (!isMember) {
            throw new IllegalStateException("User must be a member of the community to post");
        }
        
        // Get user details for author
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Create and save the post entity using your constructor
        Post post = new Post(community, author, request.getTitle(), request.getContent(), request.getImageUrl());
        
        // Save to database
        Post savedPost = postRepository.save(post);
        
        // Convert to DTO and return
        return toPostDto(savedPost);
    }

    // ✅ Get announcements by community (placeholder)
    public List<CommunityAnnouncementDto> getAnnouncementsByCommunity(UUID communityId) {
        return new ArrayList<>();
    }

    // ✅ Get members by community
    public List<CommunityMemberDto> getMembersByCommunity(UUID communityId) {
    List<UserCommunity> relations = userCommunityRepository.findByCommunityId(communityId);

    return relations.stream()
            .map(rel -> {
                // get merged user+profile
                UserProfileDto profileDto = userService.getUserProfile(rel.getUserId());

                if (profileDto != null) {
                    return CommunityMemberDto.builder()
                            .id(profileDto.getId())
                            .username(profileDto.getUsername())
                            .email(profileDto.getEmail())
                            .role(profileDto.getRole())  // from ProfileCommunity
                            .name(profileDto.getName())
                            .university(profileDto.getUniversity())
                            .profilePicUrl(profileDto.getProfilePicUrl())
                            .linkedinUrl(profileDto.getLinkedinUrl())
                            .githubUrl(profileDto.getGithubUrl())
                            .leetcodeUrl(profileDto.getLeetcodeUrl())
                            .bio(profileDto.getBio())
                            .location(profileDto.getLocation())
                            .major(profileDto.getMajor())
                            .build();
                } else {
                    return null;
                }
            })
            .filter(Objects::nonNull)
            .toList();
}


    // ✅ Seed default communities
    @PostConstruct
    public void seedCommunities() {
        if (communityRepository.count() == 0) {
            List<Community> defaults = List.of(
                    new Community("Photography Lovers", "A place for photography enthusiasts.", "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92"),
                    new Community("Fitness Freaks", "Share workouts and fitness tips.", "https://images.unsplash.com/photo-1571019613914-85f342c57f8e"),
                    new Community("Foodies Hub", "For people who love food.", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"),
                    new Community("Travel Diaries", "Explore and share travel experiences.", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"),
                    new Community("Book Club", "Discuss and share book recommendations.", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"),
                    new Community("Music Vibes", "For music lovers.", "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4"),
                    new Community("Tech Geeks", "Discuss latest in technology.", "https://images.unsplash.com/photo-1518779578993-ec3579fee39f"),
                    new Community("Gaming Arena", "Connect with gamers worldwide.", "https://images.unsplash.com/photo-1607746882042-944635dfe10e"),
                    new Community("Artistic Minds", "A space for artists to share work.", "https://images.unsplash.com/photo-1513364776144-60967b0f800f"),
                    new Community("Nature Lovers", "Appreciate the beauty of nature.", "https://images.unsplash.com/photo-1506744038136-46273834b3fb")
            );
            communityRepository.saveAll(defaults);
        }
    }
}