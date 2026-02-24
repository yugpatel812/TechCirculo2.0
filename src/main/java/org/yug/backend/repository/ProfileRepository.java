// src/main/java/org/yug/backend/repository/ProfileRepository.java
package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.Profile;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    // Find profile by username of the user
    Optional<Profile> findByUser_Username(String username);
}
