package org.yug.backend.model.post;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "post_bookmarks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"post_id", "user_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostBookmark {
    
    @Id
    @GeneratedValue
    private UUID id;
    
    @Column(name = "post_id", nullable = false)
    private UUID postId;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}