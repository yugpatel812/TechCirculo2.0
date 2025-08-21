package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.Community;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommunityRepository extends JpaRepository<Community, UUID> {
    
    List<Community> findByNameContainingIgnoreCase(String name);
}