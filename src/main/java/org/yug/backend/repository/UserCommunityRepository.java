// src/main/java/org/yug/backend/repository/UserCommunityRepository.java
package org.yug.backend.repository;

import org.apache.catalina.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.UserCommunity;
 // Import the composite key

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserCommunityRepository extends JpaRepository<UserCommunity, User> {
    List<UserCommunity> findByUser_Id(UUID userId);
    List<UserCommunity> findByCommunity_Id(UUID communityId);
    Optional<UserCommunity> findByUser_IdAndCommunity_Id(UUID userId, UUID communityId);

    boolean existsByUser_IdAndCommunity_Id(UUID userId, UUID communityId);
}