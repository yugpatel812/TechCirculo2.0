// src/main/java/org/yug/backend/repository/CommunityRepository.java
package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.Community;

import java.util.List; // Import List
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunityRepository extends JpaRepository<Community, UUID> {
    Optional<Community> findByName(String name);
    List<Community> findByNameContainingIgnoreCase(String name); // New method for search
}