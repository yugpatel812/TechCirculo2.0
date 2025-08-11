// src/main/java/org/yug/backend/dto/profile/SocialLinksRequest.java
package org.yug.backend.dto.profile;

import lombok.Data;

@Data
public class SocialLinksRequest {
    private String linkedin;
    private String github;
    private String leetcode;
}