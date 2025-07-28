package org.yug.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.yug.backend.model.auth.User;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

// Define the composite primary key class
@Data
@NoArgsConstructor
@AllArgsConstructor
class UserAnnouncementId implements Serializable {
    private UUID user;
    private UUID announcement;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_announcements")
@IdClass(UserAnnouncementId.class)
public class UserAnnouncement {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", nullable = false)
    private Announcement announcement;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "is_bookmarked")
    private Boolean isBookmarked = false;

    public UserAnnouncement(User user, Announcement announcement) {
        this.user = user;
        this.announcement = announcement;
    }
}