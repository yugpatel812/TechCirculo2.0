package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.post.PostBookmark;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostBookmarkRepository extends JpaRepository<PostBookmark, UUID> {
    
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
    
    Optional<PostBookmark> findByPostIdAndUserId(UUID postId, UUID userId);
    
    long countByPostId(UUID postId);
    
    void deleteByPostId(UUID postId);
    
    @Query("SELECT pb.postId FROM PostBookmark pb WHERE pb.userId = :userId ORDER BY pb.createdAt DESC")
    List<UUID> findPostIdsByUserId(@Param("userId") UUID userId);
}
