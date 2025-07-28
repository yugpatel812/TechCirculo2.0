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
@Data // Apply Lombok for equals and hashCode for the ID class as well
@NoArgsConstructor
@AllArgsConstructor
class UserCommunityId implements Serializable {
    private UUID user;
    private UUID community;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_communities")
@IdClass(UserCommunityId.class)
public class UserCommunity {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;


}