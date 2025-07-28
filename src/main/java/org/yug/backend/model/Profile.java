package org.yug.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.yug.backend.model.auth.User;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "name")
    private String name;

    @Column(name = "university")
    private String university;

    @Column(name = "profile_pic_url", length = 2048)
    private String profilePicUrl;

    @Column(name = "linkedin_url", length = 2048)
    private String linkedinUrl;

    @Column(name = "github_url", length = 2048)
    private String githubUrl;

    @Column(name = "leetcode_url", length = 2048)
    private String leetcodeUrl;

    public Profile(User user) {
        this.user = user;
    }

    public Profile(User user, String name, String university, String profilePicUrl, String linkedinUrl, String githubUrl, String leetcodeUrl) {
        this.user = user;
        this.name = name;
        this.university = university;
        this.profilePicUrl = profilePicUrl;
        this.linkedinUrl = linkedinUrl;
        this.githubUrl = githubUrl;
        this.leetcodeUrl = leetcodeUrl;
    }

    public void setUser(User user) {
        this.user = user;
        this.userId = (user != null) ? user.getId() : null;
    }
}