package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.PointsTransaction;
import org.yug.backend.model.UserPoints;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PointsTransactionRepository extends JpaRepository<PointsTransaction, Long> {
    
    List<PointsTransaction> findByUserPointsOrderByCreatedAtDesc(UserPoints userPoints);
    
    List<PointsTransaction> findByUserPointsIdOrderByCreatedAtDesc(Long userPointsId);
    
    // Get recent transactions across all users for activity feed
    @Query("SELECT pt FROM PointsTransaction pt " +
           "JOIN FETCH pt.userPoints up " +
           "JOIN FETCH up.profile p " +
           "ORDER BY pt.createdAt DESC")
    List<PointsTransaction> findRecentTransactions();
    
    // Get recent transactions with limit for activity feed
    @Query(value = "SELECT pt.* FROM points_transactions pt " +
                   "JOIN user_points up ON pt.user_points_id = up.id " +
                   "JOIN profiles p ON up.profile_id = p.user_id " +
                   "ORDER BY pt.created_at DESC " +
                   "LIMIT :limit", nativeQuery = true)
    List<PointsTransaction> findRecentTransactionsWithLimit(@Param("limit") Integer limit);
    
    // Get transactions by activity type
    List<PointsTransaction> findByActivityTypeOrderByCreatedAtDesc(String activityType);
    
    // Get transactions by category
    List<PointsTransaction> findByActivityCategoryOrderByCreatedAtDesc(String activityCategory);
    
    // Get transactions for a user within date range
    @Query("SELECT pt FROM PointsTransaction pt " +
           "WHERE pt.userPoints = :userPoints " +
           "AND pt.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY pt.createdAt DESC")
    List<PointsTransaction> findUserTransactionsBetweenDates(
            @Param("userPoints") UserPoints userPoints,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    // Get points summary by activity type
    @Query("SELECT pt.activityType, SUM(pt.pointsAwarded), COUNT(pt) " +
           "FROM PointsTransaction pt " +
           "GROUP BY pt.activityType " +
           "ORDER BY SUM(pt.pointsAwarded) DESC")
    List<Object[]> getPointsSummaryByActivityType();
    
    // Get points summary by category
    @Query("SELECT pt.activityCategory, SUM(pt.pointsAwarded), COUNT(pt) " +
           "FROM PointsTransaction pt " +
           "GROUP BY pt.activityCategory " +
           "ORDER BY SUM(pt.pointsAwarded) DESC")
    List<Object[]> getPointsSummaryByCategory();
    
    // Get daily points statistics
    @Query("SELECT DATE(pt.createdAt), SUM(pt.pointsAwarded), COUNT(pt) " +
           "FROM PointsTransaction pt " +
           "WHERE pt.createdAt >= :startDate " +
           "GROUP BY DATE(pt.createdAt) " +
           "ORDER BY DATE(pt.createdAt)")
    List<Object[]> getDailyPointsStatistics(@Param("startDate") LocalDateTime startDate);
    
    // Get points by activity type for a specific user
    @Query("SELECT pt.activityType, SUM(pt.pointsAwarded) " +
           "FROM PointsTransaction pt " +
           "WHERE pt.userPoints.profile.id = :profileId " +
           "GROUP BY pt.activityType")
    List<Object[]> getPointsByActivityType(@Param("profileId") UUID profileId);
    
    List<PointsTransaction> findByUserPoints_Profile_IdOrderByCreatedAtDesc(UUID profileId);
}