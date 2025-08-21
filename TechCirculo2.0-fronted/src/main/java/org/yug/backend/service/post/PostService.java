package org.yug.backend.service.post;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yug.backend.dto.community.*;
import org.yug.backend.model.*;
import org.yug.backend.model.auth.User;
import org.yug.backend.model.post.Post;
import org.yug.backend.repository.*;
import org.yug.backend.dto.post.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.yug.backend.model.post.PostLike;
import org.yug.backend.model.post.PostReport;
import org.yug.backend.model.post.PostBookmark;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final UserCommunityRepository userCommunityRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostBookmarkRepository postBookmarkRepository;
    private final PostReportRepository postReportRepository;
    private final CommentRepository commentRepository;

    // Convert Post entity to DTO with user context
    private CommunityPostDto toPostDto(Post post, UUID currentUserId) {
    boolean isLiked = false;
    boolean isBookmarked = false;
    boolean isOwner = false;

    if (currentUserId != null) {
        isLiked = postLikeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
        isBookmarked = postBookmarkRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
        isOwner = post.getAuthor().getId().equals(currentUserId);
    }

    long commentsCount = commentRepository.countByPostId(post.getId());

    // 🔥 Extra fields
    String communityImageUrl = post.getCommunity().getImageUrl();  // assuming Community entity has imageUrl
    String authorRole = post.getAuthor().getRole().name(); // from User entity
    String authorProfileUrl = (post.getAuthor().getProfile() != null) 
            ? post.getAuthor().getProfile().getProfilePicUrl() 
            : null;

    return CommunityPostDto.builder()
            .id(post.getId())
            .title(post.getTitle())
            .content(post.getContent())
            .imageUrl(post.getImageUrl())
            .authorId(post.getAuthor().getId())
            .authorName(post.getAuthor().getUsername())
            .authorRole(authorRole)  // 👈 added
            .authorProfileUrl(authorProfileUrl)  // 👈 added
            .communityId(post.getCommunity().getId())
            .communityName(post.getCommunity().getName())
            .communityImageUrl(communityImageUrl) // 👈 added
            .likesCount(post.getLikesCount() != null ? post.getLikesCount() : 0)
            .commentsCount((int) commentsCount)
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .tags(post.getTags())
            .isLiked(isLiked)
            .isBookmarked(isBookmarked)
            .isOwner(isOwner)
            .build();
}


    // Convert Post entity to DTO without user context
    private CommunityPostDto toPostDto(Post post) {
        long commentsCount = commentRepository.countByPostId(post.getId());
        
        return CommunityPostDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getUsername())
                .communityId(post.getCommunity().getId())
                .communityName(post.getCommunity().getName())
                .likesCount(post.getLikesCount() != null ? post.getLikesCount() : 0)
                .commentsCount((int) commentsCount)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .tags(post.getTags())
                .isLiked(false)
                .isBookmarked(false)
                .isOwner(false)
                .build();
    }

    // Get all posts with pagination and user context
    public Page<CommunityPostDto> getAllPosts(Pageable pageable, UUID currentUserId) {
        Page<Post> posts = postRepository.findAll(pageable);
        
        if (currentUserId != null) {
            return posts.map(post -> toPostDto(post, currentUserId));
        } else {
            return posts.map(this::toPostDto);
        }
    }

    // Get posts by specific user
    public Page<CommunityPostDto> getPostsByUser(UUID userId, Pageable pageable) {
        return getPostsByUser(userId, pageable, null);
    }

    public Page<CommunityPostDto> getPostsByUser(UUID userId, Pageable pageable, UUID currentUserId) {
        Page<Post> posts = postRepository.findByAuthorId(userId, pageable);
        
        if (currentUserId != null) {
            return posts.map(post -> toPostDto(post, currentUserId));
        } else {
            return posts.map(this::toPostDto);
        }
    }

    // Get single post by ID
    public CommunityPostDto getPostById(UUID postId, UUID currentUserId) {
        Optional<Post> post = postRepository.findById(postId);
        
        if (post.isPresent()) {
            if (currentUserId != null) {
                return toPostDto(post.get(), currentUserId);
            } else {
                return toPostDto(post.get());
            }
        }
        return null;
    }

    // Get posts by community (existing method from CommunityService)
    public List<CommunityPostDto> getPostsByCommunity(UUID communityId) {
        List<Post> posts = postRepository.findByCommunityId(communityId);
        return posts.stream().map(this::toPostDto).collect(Collectors.toList());
    }

    public List<CommunityPostDto> getPostsByCommunity(UUID communityId, UUID currentUserId) {
        List<Post> posts = postRepository.findByCommunityId(communityId);
        
        if (currentUserId != null) {
            return posts.stream().map(post -> toPostDto(post, currentUserId)).collect(Collectors.toList());
        } else {
            return posts.stream().map(this::toPostDto).collect(Collectors.toList());
        }
    }

    // Create a new post
    @Transactional
    public CommunityPostDto createPost(UUID userId, UUID communityId, PostCreateRequest request) {
        // Validate community exists
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));
        
        // Validate user is a member of the community
        boolean isMember = userCommunityRepository.existsByUserIdAndCommunityId(userId, communityId);
        if (!isMember) {
            throw new IllegalStateException("User must be a member of the community to post");
        }
        
        // Get user details
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Create post
        Post post = new Post(community, author, request.getTitle(), request.getContent(), request.getImageUrl());
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            post.setTags(request.getTags());
        }
        
        Post savedPost = postRepository.save(post);
        return toPostDto(savedPost, userId);
    }

    // Update a post
    @Transactional
    public CommunityPostDto updatePost(UUID postId, UUID userId, PostUpdateRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        // Check if user is the author
        if (!post.getAuthor().getId().equals(userId)) {
            throw new IllegalStateException("You can only update your own posts");
        }
        
        // Update fields
        if (request.getTitle() != null && !request.getTitle().isEmpty()) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null && !request.getContent().isEmpty()) {
            post.setContent(request.getContent());
        }
        if (request.getImageUrl() != null) {
            post.setImageUrl(request.getImageUrl());
        }
        if (request.getTags() != null) {
            post.setTags(request.getTags());
        }
        post.setUpdatedAt(LocalDateTime.now());
        
        Post updatedPost = postRepository.save(post);
        return toPostDto(updatedPost, userId);
    }

    // Delete a post
    @Transactional
    public void deletePost(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        // Check if user is the author or admin
        if (!post.getAuthor().getId().equals(userId)) {
            throw new IllegalStateException("You can only delete your own posts");
        }
        
        // Delete associated data first
        postLikeRepository.deleteByPostId(postId);
        postBookmarkRepository.deleteByPostId(postId);
        postReportRepository.deleteByPostId(postId);
        commentRepository.deleteByPostId(postId);
        
        // Delete the post
        postRepository.delete(post);
    }

    // Toggle like on a post
    @Transactional
    public boolean toggleLike(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        Optional<PostLike> existingLike = postLikeRepository.findByPostIdAndUserId(postId, userId);
        
        if (existingLike.isPresent()) {
            // Unlike
            postLikeRepository.delete(existingLike.get());
            updateLikesCount(postId);
            return false;
        } else {
            // Like
            PostLike like = new PostLike();
            like.setPostId(postId);
            like.setUserId(userId);
            like.setCreatedAt(LocalDateTime.now());
            postLikeRepository.save(like);
            updateLikesCount(postId);
            return true;
        }
    }

    // Get likes for a post
    public List<PostLikeDto> getPostLikes(UUID postId) {
        List<PostLike> likes = postLikeRepository.findByPostId(postId);
        
        return likes.stream().map(like -> {
            User user = userRepository.findById(like.getUserId()).orElse(null);
            return PostLikeDto.builder()
                    .userId(like.getUserId())
                    .username(user != null ? user.getUsername() : "Unknown")
                    .createdAt(like.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    // Search posts by title and content
    public Page<CommunityPostDto> searchPosts(String query, Pageable pageable, UUID currentUserId) {
        Page<Post> posts = postRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
                query, query, pageable);
        
        if (currentUserId != null) {
            return posts.map(post -> toPostDto(post, currentUserId));
        } else {
            return posts.map(this::toPostDto);
        }
    }

    // Get trending posts (posts with most likes/comments in recent time)
    public List<CommunityPostDto> getTrendingPosts(int limit, UUID currentUserId) {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<Post> posts = postRepository.findTrendingPosts(weekAgo, PageRequest.of(0, limit));
        
        if (currentUserId != null) {
            return posts.stream().map(post -> toPostDto(post, currentUserId)).collect(Collectors.toList());
        } else {
            return posts.stream().map(this::toPostDto).collect(Collectors.toList());
        }
    }

    // Get posts by tag
    public Page<CommunityPostDto> getPostsByTag(String tag, Pageable pageable, UUID currentUserId) {
        Page<Post> posts = postRepository.findByTagsContainingIgnoreCase(tag, pageable);
        
        if (currentUserId != null) {
            return posts.map(post -> toPostDto(post, currentUserId));
        } else {
            return posts.map(this::toPostDto);
        }
    }

    // Get popular tags
    public List<String> getPopularTags(int limit) {
        List<String> allTags = postRepository.findAllTags();
        
        Map<String, Integer> tagCounts = new HashMap<>();
        for (String tagString : allTags) {
            if (tagString != null && !tagString.isEmpty()) {
                String[] tags = tagString.split(",");
                for (String tag : tags) {
                    String cleanTag = tag.trim().toLowerCase();
                    if (!cleanTag.isEmpty()) {
                        tagCounts.put(cleanTag, tagCounts.getOrDefault(cleanTag, 0) + 1);
                    }
                }
            }
        }
        
        return tagCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    // Report a post
    @Transactional
    public void reportPost(UUID postId, UUID userId, String reason) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        // Check if user already reported this post
        boolean alreadyReported = postReportRepository.existsByPostIdAndUserId(postId, userId);
        if (alreadyReported) {
            throw new IllegalStateException("You have already reported this post");
        }
        
        PostReport report = new PostReport();
        report.setPostId(postId);
        report.setUserId(userId);
        report.setReason(reason);
        report.setStatus("PENDING");
        report.setCreatedAt(LocalDateTime.now());
        
        postReportRepository.save(report);
    }

    // Toggle bookmark on a post
    @Transactional
    public boolean toggleBookmark(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        Optional<PostBookmark> existingBookmark = postBookmarkRepository.findByPostIdAndUserId(postId, userId);
        
        if (existingBookmark.isPresent()) {
            // Remove bookmark
            postBookmarkRepository.delete(existingBookmark.get());
            return false;
        } else {
            // Add bookmark
            PostBookmark bookmark = new PostBookmark();
            bookmark.setPostId(postId);
            bookmark.setUserId(userId);
            bookmark.setCreatedAt(LocalDateTime.now());
            postBookmarkRepository.save(bookmark);
            return true;
        }
    }

    // Get user's bookmarked posts
    public Page<CommunityPostDto> getBookmarkedPosts(UUID userId, Pageable pageable) {
        List<UUID> bookmarkedPostIds = postBookmarkRepository.findPostIdsByUserId(userId);
        if (bookmarkedPostIds.isEmpty()) {
            return Page.empty();
        }
        
        Page<Post> posts = postRepository.findByIdIn(bookmarkedPostIds, pageable);
        return posts.map(post -> toPostDto(post, userId));
    }

    // Get post statistics
    public PostStatsDto getPostStats(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        long likesCount = postLikeRepository.countByPostId(postId);
        long commentsCount = commentRepository.countByPostId(postId);
        long bookmarksCount = postBookmarkRepository.countByPostId(postId);
        long reportsCount = postReportRepository.countByPostId(postId);
        
        return PostStatsDto.builder()
                .postId(postId)
                .likesCount(likesCount)
                .commentsCount(commentsCount)
                .bookmarksCount(bookmarksCount)
                .reportsCount(reportsCount)
                .viewsCount(0L) // You can implement view tracking separately
                .build();
    }

    // Get posts feed for user (posts from joined communities)
    public Page<CommunityPostDto> getUserFeed(UUID userId, Pageable pageable) {
        List<UUID> joinedCommunityIds = userCommunityRepository.findCommunityIdsByUserId(userId);
        
        if (joinedCommunityIds.isEmpty()) {
            return Page.empty();
        }
        
        Page<Post> posts = postRepository.findByCommunityIdIn(joinedCommunityIds, pageable);
        return posts.map(post -> toPostDto(post, userId));
    }

    // Get recent posts by user's followed communities
    public List<CommunityPostDto> getRecentPostsFromFollowedCommunities(UUID userId, int limit) {
        List<UUID> joinedCommunityIds = userCommunityRepository.findCommunityIdsByUserId(userId);
        
        if (joinedCommunityIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        List<Post> posts = postRepository.findByCommunityIdIn(joinedCommunityIds, pageable).getContent();
        
        return posts.stream()
                .map(post -> toPostDto(post, userId))
                .collect(Collectors.toList());
    }

    // Get posts that user might like (recommendation based on user's activity)
    public List<CommunityPostDto> getRecommendedPosts(UUID userId, int limit) {
        // Simple recommendation: posts from communities similar to ones user joined
        List<UUID> joinedCommunityIds = userCommunityRepository.findCommunityIdsByUserId(userId);
        List<UUID> likedPostIds = postLikeRepository.findPostIdsByUserId(userId);
        
        if (joinedCommunityIds.isEmpty()) {
            // If user hasn't joined any communities, show trending posts
            return getTrendingPosts(limit, userId);
        }
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by("likesCount").descending());
        List<Post> posts = postRepository.findByCommunityIdInAndIdNotIn(joinedCommunityIds, likedPostIds, pageable);
        
        return posts.stream()
                .map(post -> toPostDto(post, userId))
                .collect(Collectors.toList());
    }

    // Get post engagement metrics for analytics
    public PostEngagementDto getPostEngagement(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        long likesCount = postLikeRepository.countByPostId(postId);
        long commentsCount = commentRepository.countByPostId(postId);
        long bookmarksCount = postBookmarkRepository.countByPostId(postId);
        
        // Calculate engagement rate (likes + comments + bookmarks)
        long totalEngagement = likesCount + commentsCount + bookmarksCount;
        
        return PostEngagementDto.builder()
                .postId(postId)
                .likesCount(likesCount)
                .commentsCount(commentsCount)
                .bookmarksCount(bookmarksCount)
                .totalEngagement(totalEngagement)
                .createdAt(post.getCreatedAt())
                .build();
    }

    // Bulk operations for admin purposes
    @Transactional
    public void deletePostsByUser(UUID userId) {
        List<Post> userPosts = postRepository.findByAuthorId(userId);
        for (Post post : userPosts) {
            deletePost(post.getId(), userId);
        }
    }

    @Transactional
    public void hidePost(UUID postId, UUID adminUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        // Add a hidden flag or status to Post model if needed
        // post.setHidden(true);
        // post.setHiddenBy(adminUserId);
        // post.setHiddenAt(LocalDateTime.now());
        
        postRepository.save(post);
    }

    // Helper method to update likes count
    private void updateLikesCount(UUID postId) {
        long count = postLikeRepository.countByPostId(postId);
        Post post = postRepository.findById(postId).orElse(null);
        if (post != null) {
            post.setLikesCount((int) count);
            postRepository.save(post);
        }
    }

    // Get posts with most comments (discussion starters)
    public List<CommunityPostDto> getMostDiscussedPosts(int limit, UUID currentUserId) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Post> posts = postRepository.findMostDiscussedPosts(pageable);
        
        if (currentUserId != null) {
            return posts.stream().map(post -> toPostDto(post, currentUserId)).collect(Collectors.toList());
        } else {
            return posts.stream().map(this::toPostDto).collect(Collectors.toList());
        }
    }

    // Get posts by multiple communities
    public Page<CommunityPostDto> getPostsByMultipleCommunities(List<UUID> communityIds, Pageable pageable, UUID currentUserId) {
        Page<Post> posts = postRepository.findByCommunityIdIn(communityIds, pageable);
        
        if (currentUserId != null) {
            return posts.map(post -> toPostDto(post, currentUserId));
        } else {
            return posts.map(this::toPostDto);
        }
    }

    // Advanced search with filters
    public Page<CommunityPostDto> advancedSearchPosts(String query, List<UUID> communityIds, 
                                                     LocalDateTime fromDate, LocalDateTime toDate,
                                                     List<String> tags, Pageable pageable, UUID currentUserId) {
        Page<Post> posts = postRepository.findWithAdvancedFilters(
            query, communityIds, fromDate, toDate, tags, pageable);
        
        if (currentUserId != null) {
            return posts.map(post -> toPostDto(post, currentUserId));
        } else {
            return posts.map(this::toPostDto);
        }
    }
}