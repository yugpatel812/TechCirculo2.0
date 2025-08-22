package org.yug.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.yug.backend.dto.community.*;
import org.yug.backend.dto.post.PostCreateRequest;
import org.yug.backend.dto.post.PostUpdateRequest;
import org.yug.backend.service.post.PostService;
import org.yug.backend.model.auth.User;
import org.yug.backend.repository.UserRepository;
import org.yug.backend.dto.post.PostLikeDto;
import org.yug.backend.dto.post.PostStatsDto;
import org.yug.backend.model.post.PostLike;
import org.yug.backend.model.post.PostReport;
import org.yug.backend.model.post.PostBookmark;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    // Get all posts with pagination
    @GetMapping
    public ResponseEntity<Page<CommunityPostDto>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        UUID userId = null;
        if (userDetails != null) {
            User user = userRepository.findByUsername(userDetails.getUsername());
            userId = user != null ? user.getId() : null;
        }
        
        Page<CommunityPostDto> posts = postService.getAllPosts(pageable, userId);
        return ResponseEntity.ok(posts);
    }

    // Get posts by user (user's own posts)
    @GetMapping("/my-posts")
    public ResponseEntity<Page<CommunityPostDto>> getMyPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByUsername(userDetails.getUsername());
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CommunityPostDto> posts = postService.getPostsByUser(user.getId(), pageable, user.getId());
        return ResponseEntity.ok(posts);
    }

    // Get posts by specific user (public profile view)
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<CommunityPostDto>> getPostsByUser(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        UUID currentUserId = null;
        if (userDetails != null) {
            User user = userRepository.findByUsername(userDetails.getUsername());
            currentUserId = user != null ? user.getId() : null;
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CommunityPostDto> posts = postService.getPostsByUser(userId, pageable, currentUserId);
        return ResponseEntity.ok(posts);
    }

    // Get single post by ID
    @GetMapping("/{postId}")
    public ResponseEntity<CommunityPostDto> getPostById(
            @PathVariable UUID postId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        UUID userId = null;
        if (userDetails != null) {
            User user = userRepository.findByUsername(userDetails.getUsername());
            userId = user != null ? user.getId() : null;
        }
        
        CommunityPostDto post = postService.getPostById(postId, userId);
        if (post == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(post);
    }

    // Create a new post
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("communityId") UUID communityId,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            User user = userRepository.findByUsername(userDetails.getUsername());
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "User not found"
                ));
            }

            // Validate input
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error", 
                    "message", "Title is required"
                ));
            }

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Content is required"
                ));
            }

            // Handle image upload
            String imageUrl = null;
            if (image != null && !image.isEmpty()) {
                try {
                    imageUrl = saveUploadedFile(image);
                } catch (IOException e) {
                    logger.error("Error saving image: ", e);
                    return ResponseEntity.badRequest().body(Map.of(
                        "status", "error",
                        "message", "Failed to save image: " + e.getMessage()
                    ));
                }
            }
            
            // Create PostCreateRequest
            PostCreateRequest request = PostCreateRequest.builder()
                .title(title.trim())
                .content(content.trim())
                .imageUrl(imageUrl)
                .tags(tags)
                .build();

            CommunityPostDto newPost = postService.createPost(user.getId(), communityId, request);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Post created successfully",
                "post", newPost
            ));
            
        } catch (Exception e) {
            logger.error("Error creating post: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "An error occurred while creating the post"
            ));
        }
    }

    // Update a post
    @PutMapping(value = "/{postId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> updatePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID postId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            User user = userRepository.findByUsername(userDetails.getUsername());
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "User not found"
                ));
            }

            // Handle image upload
            String imageUrl = null;
            if (image != null && !image.isEmpty()) {
                try {
                    imageUrl = saveUploadedFile(image);
                } catch (IOException e) {
                    logger.error("Error saving image: ", e);
                    return ResponseEntity.badRequest().body(Map.of(
                        "status", "error",
                        "message", "Failed to save image: " + e.getMessage()
                    ));
                }
            }

            PostUpdateRequest request = PostUpdateRequest.builder()
                .title(title.trim())
                .content(content.trim())
                .imageUrl(imageUrl)
                .tags(tags)
                .build();

            CommunityPostDto updatedPost = postService.updatePost(postId, user.getId(), request);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Post updated successfully",
                "post", updatedPost
            ));
            
        } catch (Exception e) {
            logger.error("Error updating post: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    // Delete a post
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID postId) {
        
        try {
            User user = userRepository.findByUsername(userDetails.getUsername());
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "User not found"
                ));
            }

            postService.deletePost(postId, user.getId());
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Post deleted successfully"
            ));
            
        } catch (Exception e) {
            logger.error("Error deleting post: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    // Like/Unlike a post
    @PostMapping("/{postId}/like")
    public ResponseEntity<?> toggleLike(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID postId) {
        
        try {
            User user = userRepository.findByUsername(userDetails.getUsername());
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "User not found"
                ));
            }

            boolean isLiked = postService.toggleLike(postId, user.getId());
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "isLiked", isLiked,
                "message", isLiked ? "Post liked" : "Post unliked"
            ));
            
        } catch (Exception e) {
            logger.error("Error toggling like: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    // Get likes for a post
    @GetMapping("/{postId}/likes")
    public ResponseEntity<List<PostLikeDto>> getPostLikes(@PathVariable UUID postId) {
        try {
            List<PostLikeDto> likes = postService.getPostLikes(postId);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            logger.error("Error getting post likes: ", e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Search posts
    @GetMapping("/search")
    public ResponseEntity<Page<CommunityPostDto>> searchPosts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        UUID userId = null;
        if (userDetails != null) {
            User user = userRepository.findByUsername(userDetails.getUsername());
            userId = user != null ? user.getId() : null;
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CommunityPostDto> posts = postService.searchPosts(query, pageable, userId);
        return ResponseEntity.ok(posts);
    }

    // Get trending posts
    @GetMapping("/trending")
    public ResponseEntity<List<CommunityPostDto>> getTrendingPosts(
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        UUID userId = null;
        if (userDetails != null) {
            User user = userRepository.findByUsername(userDetails.getUsername());
            userId = user != null ? user.getId() : null;
        }
        
        List<CommunityPostDto> posts = postService.getTrendingPosts(limit, userId);
        return ResponseEntity.ok(posts);
    }

    // Get posts by tag
    @GetMapping("/tag/{tag}")
    public ResponseEntity<Page<CommunityPostDto>> getPostsByTag(
            @PathVariable String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        UUID userId = null;
        if (userDetails != null) {
            User user = userRepository.findByUsername(userDetails.getUsername());
            userId = user != null ? user.getId() : null;
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CommunityPostDto> posts = postService.getPostsByTag(tag, pageable, userId);
        return ResponseEntity.ok(posts);
    }

    // Get popular tags
    @GetMapping("/tags/popular")
    public ResponseEntity<List<String>> getPopularTags(@RequestParam(defaultValue = "20") int limit) {
        List<String> tags = postService.getPopularTags(limit);
        return ResponseEntity.ok(tags);
    }

    // Report a post
    @PostMapping("/{postId}/report")
    public ResponseEntity<?> reportPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID postId,
            @RequestParam String reason) {
        
        try {
            User user = userRepository.findByUsername(userDetails.getUsername());
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "User not found"
                ));
            }

            postService.reportPost(postId, user.getId(), reason);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Post reported successfully"
            ));
            
        } catch (Exception e) {
            logger.error("Error reporting post: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    // Bookmark a post
    @PostMapping("/{postId}/bookmark")
    public ResponseEntity<?> toggleBookmark(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID postId) {
        
        try {
            User user = userRepository.findByUsername(userDetails.getUsername());
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "User not found"
                ));
            }

            boolean isBookmarked = postService.toggleBookmark(postId, user.getId());
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "isBookmarked", isBookmarked,
                "message", isBookmarked ? "Post bookmarked" : "Bookmark removed"
            ));
            
        } catch (Exception e) {
            logger.error("Error toggling bookmark: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    // Get user's bookmarked posts
    @GetMapping("/bookmarks")
    public ResponseEntity<Page<CommunityPostDto>> getBookmarkedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByUsername(userDetails.getUsername());
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CommunityPostDto> posts = postService.getBookmarkedPosts(user.getId(), pageable);
        return ResponseEntity.ok(posts);
    }

    // Get post statistics
    @GetMapping("/{postId}/stats")
    public ResponseEntity<PostStatsDto> getPostStats(@PathVariable UUID postId) {
        try {
            PostStatsDto stats = postService.getPostStats(postId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error getting post stats: ", e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Helper method to save uploaded files
    private String saveUploadedFile(MultipartFile file) throws IOException {
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        
        // Validate file size (10MB limit)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File size should be less than 10MB");
        }

        // Create uploads directory
        String baseDir = System.getProperty("user.dir");
        String uploadDir = baseDir + "/uploads/posts";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? 
            originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String filename = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/posts/" + filename;
    }
}