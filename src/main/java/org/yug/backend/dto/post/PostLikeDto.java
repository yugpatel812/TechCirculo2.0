package org.yug.backend.dto.post;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostLikeDto {
    private UUID userId;
    private String username;
    private LocalDateTime createdAt;
}
