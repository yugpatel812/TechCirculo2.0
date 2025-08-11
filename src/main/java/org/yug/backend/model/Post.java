// src/main/java/org/yug/backend/model/Post.java
package org.yug.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.yug.backend.model.auth.User;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToMany
    @JoinTable(
            name = "post_communities", // Name of the new join table
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "community_id")
    )
    private Set<Community> communities = new HashSet<>(); // Relationship to a set of communities

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "likes_count")
    private Integer likesCount = 0;
    public void addCommunity(Community community) {
        this.communities.add(community);
        community.getPosts().add(this);
    }
    public Post(User author, String title, String content, String imageUrl, Set<Community> communities) {
        this.author = author;
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
        this.communities = communities;
    }
}