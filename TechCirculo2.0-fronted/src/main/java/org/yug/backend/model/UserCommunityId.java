package org.yug.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCommunityId implements Serializable {
    private UUID userId;
    private UUID communityId;
}