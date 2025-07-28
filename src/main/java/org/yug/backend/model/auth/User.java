package org.yug.backend.model.auth;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.yug.backend.model.Post;
import org.yug.backend.model.Profile;
import org.yug.backend.model.UserAnnouncement;
import org.yug.backend.model.UserCommunity;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // Store hashed passwords here

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.STUDENT;

    @Column(name = "username", nullable = false)
    private String username;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Profile profile;

    // --- Relationships ---
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserCommunity> userCommunities = new HashSet<>();

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Post> posts = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserAnnouncement> userAnnouncements = new HashSet<>();

    // Enum for user roles
    public enum UserRole {
        STUDENT, TEACHER, ALUMNI, ADMIN
    }

    public User(String email, String password, String username, UserRole role) {
        this.email = email;
        this.password = password;
        this.username = username;
        this.role = role;
    }

    // Helper methods for relationships (important for Many-to-Many ownership)
    public void addUserCommunity(UserCommunity userCommunity) {
        this.userCommunities.add(userCommunity);
        userCommunity.setUser(this);
    }

    public void removeUserCommunity(UserCommunity userCommunity) {
        this.userCommunities.remove(userCommunity);
        userCommunity.setUser(null);
    }

    public void addPost(Post post) {
        this.posts.add(post);
        post.setAuthor(this);
    }

    public void addUserAnnouncement(UserAnnouncement userAnnouncement) {
        this.userAnnouncements.add(userAnnouncement);
        userAnnouncement.setUser(this);
    }
}