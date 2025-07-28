package org.yug.backend.repository;

import org.springframework.stereotype.Repository;
import org.yug.backend.model.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    User findByUsername(String username);
}