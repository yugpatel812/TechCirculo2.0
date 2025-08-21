package org.yug.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.yug.backend.model.auth.User;


import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @Column(name = "user_id")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
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

    @Column(name = "email")
    private String email;
    
    @Column(name = "major")
    private String major;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "bio", length = 1000)
    private String bio;

    public Profile(User user) {
        this.user = user;
        this.id = user != null ? user.getId() : null;
    }

    public Profile(User user, String name, String university, String profilePicUrl,
                   String linkedinUrl, String githubUrl, String leetcodeUrl) {
        this(user);
        this.name = name;
        this.university = university;
        this.profilePicUrl = profilePicUrl;
        this.linkedinUrl = linkedinUrl;
        this.githubUrl = githubUrl;
        this.leetcodeUrl = leetcodeUrl;
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Profile profile = (Profile) o;
        return id != null && id.equals(profile.id);
    }
}