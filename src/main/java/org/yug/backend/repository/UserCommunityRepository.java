package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.UserCommunity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserCommunityRepository extends JpaRepository<UserCommunity, UUID> {
    
    // Existing methods
    boolean existsByUserIdAndCommunityId(UUID userId, UUID communityId);
    
    Optional<UserCommunity> findByUserIdAndCommunityId(UUID userId, UUID communityId);
    
    List<UserCommunity> findByUserId(UUID userId);
    
    List<UserCommunity> findByCommunityId(UUID communityId);
    
    long countByCommunityId(UUID communityId);
    
    // New methods for enhanced functionality
    @Query("SELECT uc.communityId FROM UserCommunity uc WHERE uc.userId = :userId")
    List<UUID> findCommunityIdsByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT uc.userId FROM UserCommunity uc WHERE uc.communityId = :communityId")
    List<UUID> findUserIdsByCommunityId(@Param("communityId") UUID communityId);
    
    // Get communities user joined recently
    @Query("SELECT uc FROM UserCommunity uc WHERE uc.userId = :userId ORDER BY uc.joinedAt DESC")
    List<UserCommunity> findRecentlyJoinedCommunities(@Param("userId") UUID userId);
    
    // Find users who are members of multiple specific communities
    @Query("SELECT uc.userId FROM UserCommunity uc WHERE uc.communityId IN :communityIds " +
           "GROUP BY uc.userId HAVING COUNT(uc.communityId) = :communityCount")
    List<UUID> findUsersInAllCommunities(@Param("communityIds") List<UUID> communityIds, 
                                        @Param("communityCount") long communityCount);
}