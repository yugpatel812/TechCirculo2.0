package org.yug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yug.backend.model.Badge;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    
    Optional<Badge> findByBadgeKey(String badgeKey);
    
    List<Badge> findByCategory(String category);
    
    List<Badge> findByIsActiveTrue();
    
    List<Badge> findByCategoryAndIsActiveTrue(String category);
    
    List<Badge> findByConditionTypeAndIsActive(String conditionType, Boolean isActive);
    
    List<Badge> findByConditionType(String conditionType);
}