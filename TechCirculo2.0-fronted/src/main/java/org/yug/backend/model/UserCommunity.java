package org.yug.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.yug.backend.model.auth.User;

import java.util.UUID;

@Data
@NoArgsConstructor
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", insertable = false, updatable = false)
    private Community community;


}