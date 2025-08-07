package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.UserCommunity;
import org.yug.backend.model.UserCommunityId;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserCommunityRepository extends JpaRepository<UserCommunity, UserCommunityId> {

    // Correct method names matching the entity fields (userId, communityId)
    List<UserCommunity> findByUserId(UUID userId);

    List<UserCommunity> findByCommunityId(UUID communityId);

    Optional<UserCommunity> findByUserIdAndCommunityId(UUID userId, UUID communityId);

    boolean existsByUserIdAndCommunityId(UUID userId, UUID communityId);
    long countByCommunityId(UUID communityId);
}