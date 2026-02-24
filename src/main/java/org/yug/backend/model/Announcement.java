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
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "type", nullable = false)
    private String type; // e.g., "update", "event", "general"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id") // Nullable for general announcements
    private Community community;

    // --- Relationships ---
    @OneToMany(mappedBy = "announcement", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserAnnouncement> userAnnouncements = new HashSet<>();

    public Announcement(String title, String content, String type, Community community) {
        this.title = title;
        this.content = content;
        this.type = type;
        this.community = community;
    }

    // Helper method for relationships
    public void addUserAnnouncement(UserAnnouncement userAnnouncement) {
        this.userAnnouncements.add(userAnnouncement);
        userAnnouncement.setAnnouncement(this);
    }
}