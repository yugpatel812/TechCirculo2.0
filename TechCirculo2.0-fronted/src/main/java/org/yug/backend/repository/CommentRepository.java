package org.yug.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.post.Comment;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    
    List<Comment> findByPostIdOrderByCreatedAtDesc(UUID postId);
    
    Page<Comment> findByPostId(UUID postId, Pageable pageable);
    
    long countByPostId(UUID postId);
    
    List<Comment> findByParentCommentId(UUID parentCommentId);
    
    void deleteByPostId(UUID postId);
    
    @Query("SELECT c FROM Comment c WHERE c.author.id = :userId ORDER BY c.createdAt DESC")
    List<Comment> findByAuthorId(@Param("userId") UUID userId);
}