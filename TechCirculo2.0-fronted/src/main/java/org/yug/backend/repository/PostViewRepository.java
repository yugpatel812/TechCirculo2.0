package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.post.PostView;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PostViewRepository extends JpaRepository<PostView, UUID> {
    
    long countByPostId(UUID postId);
    
    boolean existsByPostIdAndUserIdAndViewedDateBetween(UUID postId, UUID userId, 
                                                       LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(DISTINCT pv.userId) FROM PostView pv WHERE pv.postId = :postId")
    long countUniqueViewersByPostId(@Param("postId") UUID postId);
    
    @Query("SELECT pv.postId, COUNT(pv) as viewCount FROM PostView pv " +
           "WHERE pv.viewedDate >= :fromDate " +
           "GROUP BY pv.postId " +
           "ORDER BY viewCount DESC")
    List<Object[]> findMostViewedPosts(@Param("fromDate") LocalDateTime fromDate);
    
    void deleteByPostId(UUID postId);
}