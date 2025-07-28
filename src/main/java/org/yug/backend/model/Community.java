package org.yug.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "communities")
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "name", unique = true, nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "member_count")
    private Integer memberCount = 0;

    // --- Relationships ---
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserCommunity> userCommunities = new HashSet<>();

    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Post> posts = new HashSet<>();

    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Announcement> announcements = new HashSet<>();

    public Community(String name, String description, String imageUrl) {
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    // Helper methods for relationships
    public void addUserCommunity(UserCommunity userCommunity) {
        this.userCommunities.add(userCommunity);
        userCommunity.setCommunity(this);
        this.memberCount = this.userCommunities.size();
    }

    public void removeUserCommunity(UserCommunity userCommunity) {
        this.userCommunities.remove(userCommunity);
        userCommunity.setCommunity(null);
        this.memberCount = this.userCommunities.size();
    }

    public void addPost(Post post) {
        this.posts.add(post);
        post.setCommunity(this);
    }

    public void addAnnouncement(Announcement announcement) {
        this.announcements.add(announcement);
        announcement.setCommunity(this);
    }
}