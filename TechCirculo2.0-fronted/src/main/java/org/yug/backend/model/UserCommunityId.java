package org.yug.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCommunityId implements Serializable {
    
    private UUID userId;
    private UUID communityId;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        UserCommunityId that = (UserCommunityId) o;
        
        if (!userId.equals(that.userId)) return false;
        return communityId.equals(that.communityId);
    }

    @Override
    public int hashCode() {
        int result = userId.hashCode();
        result = 31 * result + communityId.hashCode();
        return result;
    }
}