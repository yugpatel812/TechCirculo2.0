package org.yug.backend.model.post;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.yug.backend.model.auth.User;
import org.yug.backend.model.Community;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "posts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    
    @Id
    @GeneratedValue
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "likes_count")
    private Integer likesCount = 0;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // New fields for enhanced functionality
    @Column
    private String tags; // Comma-separated tags
    
    @Column(name = "is_pinned")
    private Boolean isPinned = false;
    
    @Column(name = "is_hidden")
    private Boolean isHidden = false;
    
    @Column(name = "hidden_by")
    private UUID hiddenBy;
    
    @Column(name = "hidden_at")
    private LocalDateTime hiddenAt;
    
    // Constructors
    public Post(Community community, User author, String title, String content, String imageUrl) {
        this.community = community;
        this.author = author;
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}