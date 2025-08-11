// src/main/java/org/yug/backend/repository/PostRepository.java
package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.Post;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    List<Post> findByCommunityId(UUID communityId);
    List<Post> findByAuthorId(UUID authorId); // For fetching user's posts on profile page
}