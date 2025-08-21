package org.yug.backend.model.post;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "post_views", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"post_id", "user_id", "viewed_date"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostView {
    
    @Id
    @GeneratedValue
    private UUID id;
    
    @Column(name = "post_id", nullable = false)
    private UUID postId;
    
    @Column(name = "user_id") // nullable for anonymous views
    private UUID userId;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "viewed_date")
    private LocalDateTime viewedDate;
    
    @PrePersist
    protected void onCreate() {
        viewedDate = LocalDateTime.now();
    }
}