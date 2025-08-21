package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.post.PostReport;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostReportRepository extends JpaRepository<PostReport, UUID> {
    
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
    
    List<PostReport> findByPostId(UUID postId);
    
    List<PostReport> findByStatus(String status);
    
    long countByPostId(UUID postId);
    
    void deleteByPostId(UUID postId);
}