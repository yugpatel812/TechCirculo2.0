package org.yug.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.post.Post;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    
    // Existing methods
    List<Post> findByCommunityId(UUID communityId);
    
    Page<Post> findByAuthorId(UUID authorId, Pageable pageable);
    
    List<Post> findByAuthorId(UUID authorId);
    
    // New methods for enhanced functionality
    Page<Post> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
            String title, String content, Pageable pageable);
    
    Page<Post> findByTagsContainingIgnoreCase(String tag, Pageable pageable);
    
    @Query("SELECT p.tags FROM Post p WHERE p.tags IS NOT NULL")
    List<String> findAllTags();
    
    @Query("SELECT p FROM Post p WHERE p.createdAt >= :fromDate ORDER BY p.likesCount DESC, p.createdAt DESC")
    List<Post> findTrendingPosts(@Param("fromDate") LocalDateTime fromDate, Pageable pageable);
    
    Page<Post> findByCommunityIdIn(List<UUID> communityIds, Pageable pageable);
    
    Page<Post> findByIdIn(List<UUID> postIds, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.community.id IN :communityIds AND p.id NOT IN :excludeIds ORDER BY p.likesCount DESC")
    List<Post> findByCommunityIdInAndIdNotIn(@Param("communityIds") List<UUID> communityIds, 
                                           @Param("excludeIds") List<UUID> excludeIds, 
                                           Pageable pageable);
    
    @Query("SELECT p FROM Post p LEFT JOIN Comment c ON p.id = c.postId " +
           "GROUP BY p.id ORDER BY COUNT(c.id) DESC")
    List<Post> findMostDiscussedPosts(Pageable pageable);
    
   @Query(
  value = """
    SELECT * FROM posts p
    WHERE (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) 
           OR LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')))
      AND (:communityIds IS NULL OR p.community_id IN (:communityIds))
      AND (:fromDate IS NULL OR p.created_at >= :fromDate)
      AND (:toDate IS NULL OR p.created_at <= :toDate)
      AND (:tags IS NULL OR EXISTS (
            SELECT 1 
            FROM unnest(string_to_array(p.tags, ',')) AS tag 
            WHERE LOWER(TRIM(tag)) IN (:tags)
          ))
    """,
  countQuery = """
    SELECT COUNT(*) FROM posts p
    WHERE (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) 
           OR LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')))
      AND (:communityIds IS NULL OR p.community_id IN (:communityIds))
      AND (:fromDate IS NULL OR p.created_at >= :fromDate)
      AND (:toDate IS NULL OR p.created_at <= :toDate)
      AND (:tags IS NULL OR EXISTS (
            SELECT 1 
            FROM unnest(string_to_array(p.tags, ',')) AS tag 
            WHERE LOWER(TRIM(tag)) IN (:tags)
          ))
    """,
  nativeQuery = true
)
Page<Post> findWithAdvancedFilters(@Param("query") String query,
                                   @Param("communityIds") List<UUID> communityIds,
                                   @Param("fromDate") LocalDateTime fromDate,
                                   @Param("toDate") LocalDateTime toDate,
                                   @Param("tags") List<String> tags,
                                   Pageable pageable);

    // Posts by community with pagination
    Page<Post> findByCommunityId(UUID communityId, Pageable pageable);
    
    // Hidden/Visible posts
    Page<Post> findByIsHiddenFalse(Pageable pageable);
    
    Page<Post> findByIsHiddenTrue(Pageable pageable);
    
    // Pinned posts
    List<Post> findByCommunityIdAndIsPinnedTrueOrderByCreatedAtDesc(UUID communityId);
    
    // Posts with minimum like count
    @Query("SELECT p FROM Post p WHERE p.likesCount >= :minLikes ORDER BY p.likesCount DESC")
    List<Post> findPostsWithMinimumLikes(@Param("minLikes") int minLikes, Pageable pageable);
    
    // Recent posts from specific time period
    @Query("SELECT p FROM Post p WHERE p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    List<Post> findPostsInDateRange(@Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate,
                                   Pageable pageable);
    
    // Posts with images only
    Page<Post> findByImageUrlIsNotNull(Pageable pageable);
    
    // User activity - posts with user interactions
    @Query("SELECT DISTINCT p FROM Post p " +
           "LEFT JOIN PostLike pl ON p.id = pl.postId " +
           "LEFT JOIN PostBookmark pb ON p.id = pb.postId " +
           "LEFT JOIN Comment c ON p.id = c.postId " +
           "WHERE pl.userId = :userId OR pb.userId = :userId OR c.author.id = :userId " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findPostsWithUserActivity(@Param("userId") UUID userId, Pageable pageable);
}