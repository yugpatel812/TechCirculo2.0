package org.yug.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.yug.backend.model.Community;
import org.yug.backend.repository.CommunityRepository;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final CommunityRepository communityRepository;

    public DatabaseSeeder(CommunityRepository communityRepository) {
        this.communityRepository = communityRepository;
    }

    @Override
    public void run(String... args) {
        if (communityRepository.count() == 0) {
            communityRepository.save(new Community(
                "Tech Enthusiasts",
                "A place for all tech lovers.",
                "https://images.unsplash.com/photo-1518770660439-4636190af475"
            ));
            communityRepository.save(new Community(
                "Book Club",
                "Discuss and share your favorite reads.",
                "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"
            ));
            communityRepository.save(new Community(
                "Fitness Hub",
                "For health and fitness discussions.",
                "https://images.unsplash.com/photo-1571019613576-2b21dc5d7d8b"
            ));
            communityRepository.save(new Community(
                "Foodies United",
                "Share recipes, restaurant reviews, and food pics.",
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
            ));
            communityRepository.save(new Community(
                "Travel Diaries",
                "Explore the world through shared travel stories.",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
            ));
            communityRepository.save(new Community(
                "Music Lovers",
                "Talk about your favorite music, bands, and concerts.",
                "https://images.unsplash.com/photo-1511379938547-c1f69419868d"
            ));
            communityRepository.save(new Community(
                "Photography Zone",
                "A space for photographers to share their art.",
                "https://images.unsplash.com/photo-1504198266285-165a16f2b5cc"
            ));
            communityRepository.save(new Community(
                "Gamers Arena",
                "Connect with gamers and discuss latest releases.",
                "https://images.unsplash.com/photo-1614082242765-1b5b72d0f0a0"
            ));
            communityRepository.save(new Community(
                "Nature Lovers",
                "Celebrate the beauty of nature.",
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
            ));
            communityRepository.save(new Community(
                "Startup Founders",
                "Discuss business ideas and entrepreneurship.",
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
            ));

            System.out.println("✅ 10 default communities inserted successfully!");
        }
    }
}
