// src/main/java/org/yug/backend/dto/profile/ProfileRequest.java
package org.yug.backend.dto.profile;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String university;
    private String profilePic; // Base64 or URL
}