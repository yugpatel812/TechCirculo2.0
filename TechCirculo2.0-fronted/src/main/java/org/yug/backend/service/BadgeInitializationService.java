package org.yug.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.yug.backend.model.Badge;
import org.yug.backend.repository.BadgeRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class BadgeInitializationService implements CommandLineRunner {

    @Autowired
    private BadgeRepository badgeRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeDefaultBadges();
    }

    private void initializeDefaultBadges() {
        // Only initialize if no badges exist
        if (badgeRepository.count() > 0) {
            return;
        }

        List<Badge> defaultBadges = Arrays.asList(
                // Points-based badges
                Badge.builder()
                        .badgeKey("first_steps")
                        .name("First Steps")
                        .description("Earn your first 50 points")
                        .icon("🌟")
                        .category("POINTS")
                        .conditionType("POINTS_TOTAL")
                        .conditionValue(50)
                        .pointsReward(10)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build(),

                Badge.builder()
                        .badgeKey("rising_star")
                        .name("Rising Star")
                        .description("Reach 200 total points")
                        .icon("⭐")
                        .category("POINTS")
                        .conditionType("POINTS_TOTAL")
                        .conditionValue(200)
                        .pointsReward(25)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build(),

                Badge.builder()
                        .badgeKey("point_master")
                        .name("Point Master")
                        .description("Accumulate 500 points")
                        .icon("🏆")
                        .category("POINTS")
                        .conditionType("POINTS_TOTAL")
                        .conditionValue(500)
                        .pointsReward(50)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build(),

                Badge.builder()
                        .badgeKey("elite_achiever")
                        .name("Elite Achiever")
                        .description("Reach 1000 total points")
                        .icon("💎")
                        .category("POINTS")
                        .conditionType("POINTS_TOTAL")
                        .conditionValue(1000)
                        .pointsReward(100)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build(),

                // Streak-based badges
                Badge.builder()
                        .badgeKey("consistent")
                        .name("Consistent")
                        .description("Maintain a 3-day streak")
                        .icon("🔥")
                        .category("STREAK")
                        .conditionType("STREAK_DAYS")
                        .conditionValue(3)
                        .pointsReward(20)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build(),

                Badge.builder()
                        .badgeKey("dedicated")
                        .name("Dedicated")
                        .description("Keep a 7-day streak")
                        .icon("🚀")
                        .category("STREAK")
                        .conditionType("STREAK_DAYS")
                        .conditionValue(7)
                        .pointsReward(50)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build(),

                Badge.builder()
                        .badgeKey("unstoppable")
                        .name("Unstoppable")
                        .description("Achieve a 14-day streak")
                        .icon("⚡")
                        .category("STREAK")
                        .conditionType("STREAK_DAYS")
                        .conditionValue(14)
                        .pointsReward(100)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build(),

                // Activity-based badges
                Badge.builder()
                        .badgeKey("first_post")
                        .name("First Post")
                        .description("Create your first community post")
                        .icon("📝")
                        .category("COMMUNITY")
                        .conditionType("ACTIVITY_COUNT")
                        .conditionValue(1)
                        .pointsReward(15)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build(),

                Badge.builder()
                        .badgeKey("social_butterfly")
                        .name("Social Butterfly")
                        .description("Make 10 posts in the community")
                        .icon("🦋")
                        .category("COMMUNITY")
                        .conditionType("ACTIVITY_COUNT")
                        .conditionValue(10)
                        .pointsReward(30)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build(),

                Badge.builder()
                        .badgeKey("community_leader")
                        .name("Community Leader")
                        .description("Create 25 community posts")
                        .icon("👑")
                        .category("COMMUNITY")
                        .conditionType("ACTIVITY_COUNT")
                        .conditionValue(25)
                        .pointsReward(75)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        badgeRepository.saveAll(defaultBadges);
        System.out.println("✅ Initialized " + defaultBadges.size() + " default badges");
    }
}