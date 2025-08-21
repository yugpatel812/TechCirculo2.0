package org.yug.backend.model.post;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "post_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostReport {
    
    @Id
    @GeneratedValue
    private UUID id;
    
    @Column(name = "post_id", nullable = false)
    private UUID postId;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(nullable = false)
    private String reason;
    
    @Column
    private String status = "PENDING"; // PENDING, REVIEWED, RESOLVED
    
    @Column(name = "admin_notes")
    private String adminNotes;
    
    @Column(name = "reviewed_by")
    private UUID reviewedBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}