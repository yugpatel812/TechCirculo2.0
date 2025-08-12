package org.yug.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.yug.backend.model.Community;
import org.yug.backend.model.Profile;
import org.yug.backend.model.UserCommunity;
import org.yug.backend.model.auth.User;
import org.yug.backend.repository.CommunityRepository;
import org.yug.backend.repository.UserCommunityRepository;
import org.yug.backend.repository.UserRepository;

import java.util.List;
import java.util.Random;
import java.util.UUID;


@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataLoader.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private UserCommunityRepository userCommunityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only load data if the database is empty
        if (userRepository.count() == 0 && communityRepository.count() == 0) {
            loadInitialData();
        } else {
            logger.info("Database already contains data. Skipping initial data loading.");
        }
    }

    @Transactional
    public void loadInitialData() {
        logger.info("Loading initial data...");

        // Create communities first
        createAndSaveCommunity(
                "Web Development",
                "Share knowledge and stay updated with the latest web technologies.",
                "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"
        );
        createAndSaveCommunity(
                "Blockchain Technology",
                "Dive into decentralized ledgers, cryptocurrencies, and smart contracts.",
                "https://plus.unsplash.com/premium_photo-1661877737564-3dfd7282efcb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y3liZXJzZWN1cml0eXxlbnwwfHwwfHx8MA%3D%3D"
        );
        createAndSaveCommunity(
                "Competitive Programming",
                "Practice algorithms, solve problems, and prepare for coding contests.",
                "https://images.unsplash.com/photo-1587620931257-2c93945d1655?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNvZGluZyUyMGNvbnRlc3R8ZW58MHx8MHx8fDA%3D"
        );
        createAndSaveCommunity(
                "Cybersecurity Gurus",
                "Discussions on ethical hacking, network security, and data protection.",
                "https://images.unsplash.com/photo-1614064548237-096f735f344f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y3liZXIlMjBzZWN1cml0eXxlbnwwfHwwfHx8MA%3D%3D"
        );
        createAndSaveCommunity(
                "Mobile App Development",
                "Learn and discuss mobile app development strategies for Android and iOS.",
                "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=300&h=200&fit=crop"
        );
        createAndSaveCommunity(
                "Data Science & AI",
                "Deep dive into data analysis, machine learning, and artificial intelligence.",
                "https://plus.unsplash.com/premium_photo-1661878265739-da90bc1af051?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGF0YSUyMHNjaWVuY2V8ZW58MHx8MHx8fDA%3D"
        );
        createAndSaveCommunity(
                "UI/UX Design",
                "Discuss user experience, interface design principles, and tools.",
                "https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aW50ZXJmYWNlfGVufDB8fDB8fHww"
        );
        createAndSaveCommunity(
                "Game Development",
                "Create, play, and discuss games across various platforms.",
                "https://images.unsplash.com/photo-1542810634-71277d352478?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Z2FtZSUyMGRldmVsb3BtZW50fGVufDB8fDB8fHww"
        );
        createAndSaveCommunity(
                "IoT and Robotics",
                "Connect with innovators in the Internet of Things and robotics.",
                "https://images.unsplash.com/photo-1531846990595-d14cf122906b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aW90fGVufDB8fDB8fHww"
        );
        createAndSaveCommunity(
                "Cloud Computing Enthusiasts",
                "Explore AWS, Azure, Google Cloud, and DevOps practices.",
                "https://plus.unsplash.com/premium_photo-1688678097425-00bba1629e32?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGNsb3VkJTIwZW5naW5lZXJpbmd8ZW58MHx8MHx8fDA%3D"
        );

        logger.info("Community data loaded successfully!");

        // Create and save users
        User student1 = createAndSaveUser("student1", "student1@paruluniversity.ac.in", "pass123", User.UserRole.STUDENT);
        User teacher1 = createAndSaveUser("teacher1", "teacher1@paruluniversity.ac.in", "pass123", User.UserRole.TEACHER);
        User alumni1 = createAndSaveUser("alumni1", "alumni1@paruluniversity.ac.in", "pass123", User.UserRole.ALUMNI);
        User admin = createAndSaveUser("admin", "admin@paruluniversity.ac.in", "adminpass", User.UserRole.ADMIN);

        // Fetch all communities to link with users
        List<Community> communities = communityRepository.findAll();
        Random random = new Random();

        // Assign users to random communities
        assignUserToRandomCommunities(student1, communities, random);
        assignUserToRandomCommunities(teacher1, communities, random);
        assignUserToRandomCommunities(alumni1, communities, random);
        assignUserToRandomCommunities(admin, communities, random);

        logger.info("Dummy users created and assigned to communities successfully!");
    }

    private void createAndSaveCommunity(String name, String description, String imageUrl) {
        Community community = new Community();
        community.setName(name);
        community.setDescription(description);
        community.setImageUrl(imageUrl);
        community.setMemberCount(0L);
        communityRepository.save(community);
    }

    private User createAndSaveUser(String username, String email, String password, User.UserRole role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);

        Profile profile = new Profile(user);
        profile.setName(username);
        user.setProfile(profile);

        userRepository.save(user);
        return user;
    }

    private void assignUserToRandomCommunities(User user, List<Community> communities, Random random) {
        int communitiesToJoin = random.nextInt(3) + 1;
        for (int i = 0; i < communitiesToJoin; i++) {
            Community randomCommunity = communities.get(random.nextInt(communities.size()));

            UserCommunity userCommunity = new UserCommunity();
            userCommunity.setUserId(user.getId());
            userCommunity.setCommunityId(randomCommunity.getId());
            userCommunity.setUser(user);
            userCommunity.setCommunity(randomCommunity);

            userCommunityRepository.save(userCommunity);

            long currentMemberCount = userCommunityRepository.countByCommunityId(randomCommunity.getId());
            randomCommunity.setMemberCount(currentMemberCount);
            communityRepository.save(randomCommunity);
        }
    }
}