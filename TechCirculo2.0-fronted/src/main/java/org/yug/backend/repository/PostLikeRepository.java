
// PostLikeRepository.java
package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.post.PostLike;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, UUID> {
    
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
    
    Optional<PostLike> findByPostIdAndUserId(UUID postId, UUID userId);
    
    List<PostLike> findByPostId(UUID postId);
    
    long countByPostId(UUID postId);
    
    void deleteByPostId(UUID postId);
    
    @Query("SELECT pl.postId FROM PostLike pl WHERE pl.userId = :userId")
    List<UUID> findPostIdsByUserId(@Param("userId") UUID userId);
}