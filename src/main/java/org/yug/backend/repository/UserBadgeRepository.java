package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.UserBadge;
import org.yug.backend.model.UserPoints;
import org.yug.backend.model.Badge;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    
    List<UserBadge> findByUserPointsOrderByEarnedAtDesc(UserPoints userPoints);
    
    List<UserBadge> findByUserPointsIdOrderByEarnedAtDesc(Long userPointsId);
    
    boolean existsByUserPointsAndBadge(UserPoints userPoints, Badge badge);
    
    List<UserBadge> findByNotifiedFalse();
    
    @Query("SELECT ub FROM UserBadge ub " +
           "JOIN FETCH ub.badge " +
           "JOIN FETCH ub.userPoints up " +
           "JOIN FETCH up.profile " +
           "ORDER BY ub.earnedAt DESC")
    List<UserBadge> findRecentBadgesWithDetails();
    
    List<UserBadge> findByUserPoints_Profile_IdOrderByEarnedAtDesc(UUID profileId);
}