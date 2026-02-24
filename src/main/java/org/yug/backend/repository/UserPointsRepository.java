package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.UserPoints;
import org.yug.backend.model.Profile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPointsRepository extends JpaRepository<UserPoints, Long> {
    
    Optional<UserPoints> findByProfile(Profile profile);
    
    Optional<UserPoints> findByProfileId(UUID profileId);
    
    // Get top users by total points for leaderboard
    @Query("SELECT up FROM UserPoints up LEFT JOIN FETCH up.profile p LEFT JOIN FETCH p.user " +
           "ORDER BY up.totalPoints DESC")
    List<UserPoints> findTopUsersByPoints();
    
    // Get users by points range (for level-based queries)
    @Query("SELECT up FROM UserPoints up JOIN FETCH up.profile " +
           "WHERE up.totalPoints BETWEEN :minPoints AND :maxPoints " +
           "ORDER BY up.totalPoints DESC")
    List<UserPoints> findUsersByPointsRange(@Param("minPoints") Integer minPoints, 
                                           @Param("maxPoints") Integer maxPoints);
    
    // Get users by level
    @Query("SELECT up FROM UserPoints up JOIN FETCH up.profile " +
           "WHERE up.currentLevel = :level " +
           "ORDER BY up.totalPoints DESC")
    List<UserPoints> findUsersByLevel(@Param("level") Integer level);
    
    // Get users with activity in last N days
    @Query("SELECT up FROM UserPoints up JOIN FETCH up.profile " +
           "WHERE up.lastActivity >= :sinceDate " +
           "ORDER BY up.lastActivity DESC")
    List<UserPoints> findActiveUsersSince(@Param("sinceDate") LocalDateTime sinceDate);
    
    // Get top users by weekly points
    @Query("SELECT up FROM UserPoints up JOIN FETCH up.profile " +
           "WHERE up.weeklyPoints > 0 " +
           "ORDER BY up.weeklyPoints DESC")
    List<UserPoints> findTopWeeklyUsers();
    
    // Get top users by monthly points
    @Query("SELECT up FROM UserPoints up JOIN FETCH up.profile " +
           "WHERE up.monthlyPoints > 0 " +
           "ORDER BY up.monthlyPoints DESC")
    List<UserPoints> findTopMonthlyUsers();
    
    // Count users by level
    @Query("SELECT up.currentLevel, COUNT(up) FROM UserPoints up " +
           "GROUP BY up.currentLevel " +
           "ORDER BY up.currentLevel")
    List<Object[]> countUsersByLevel();
    
    // Get total points across all users
    @Query("SELECT SUM(up.totalPoints) FROM UserPoints up")
    Long getTotalPointsAcrossAllUsers();
    
    // Find users who need weekly points reset (for scheduled job)
    @Query("SELECT up FROM UserPoints up " +
           "WHERE up.weeklyPoints > 0 AND up.lastActivity < :weekAgo")
    List<UserPoints> findUsersNeedingWeeklyReset(@Param("weekAgo") LocalDateTime weekAgo);
    
    // Find users who need monthly points reset (for scheduled job)
    @Query("SELECT up FROM UserPoints up " +
           "WHERE up.monthlyPoints > 0 AND up.lastActivity < :monthAgo")
    List<UserPoints> findUsersNeedingMonthlyReset(@Param("monthAgo") LocalDateTime monthAgo);
    
    // Get user's rank by points
    @Query("SELECT COUNT(up) + 1 FROM UserPoints up " +
           "WHERE up.totalPoints > (SELECT up2.totalPoints FROM UserPoints up2 WHERE up2.profile.id = :profileId)")
    Long getUserRankByPoints(@Param("profileId") UUID profileId);
}