// src/main/java/org/yug/backend/repository/PostRepository.java
package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.Post;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    // Custom query to find posts by community ID
    @Query("SELECT p FROM Post p JOIN p.communities c WHERE c.id = :communityId")
    List<Post> findPostsByCommunityId(UUID communityId);

    // Method to save post-community association
    @Modifying
    @Query(value = "INSERT INTO post_communities (post_id, community_id) VALUES (:postId, :communityId)",
            nativeQuery = true)
    void addPostToCommunity(UUID postId, UUID communityId);
}