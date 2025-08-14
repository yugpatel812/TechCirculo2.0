package org.yug.backend.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.Post;
import org.yug.backend.model.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    @Query("SELECT p FROM Post p JOIN p.author a WHERE a.id = :id")
    static List<Post> findPostsByUserId(UUID id) {
        // This method is static because it is used in a static context in the PostService
        // It should not be called directly on the repository instance
        throw new UnsupportedOperationException("This method should not be called directly");
    }

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    User findByUsername(String username);
}