package org.yug.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.yug.backend.model.auth.User;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_communities")
@IdClass(UserCommunityId.class) // Specify the composite key class
public class UserCommunity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "community_id")
    private UUID communityId;

    @Column(name = "role")
    private String role;

    @Column(name = "joined_at")  
    private LocalDateTime joinedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", insertable = false, updatable = false)
    private Community community;

    // Method to get role (needed by CommunityService)
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}