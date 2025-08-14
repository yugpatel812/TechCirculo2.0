// src/main/java/org/yug/backend/service/MyUserDetailsService.java
package org.yug.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.yug.backend.model.auth.User;
import org.yug.backend.model.auth.UserPrincipal;
import org.yug.backend.repository.UserRepository;

import java.util.Optional;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository repo;

    /**
     * This method is used by Spring Security's DaoAuthenticationProvider for email/password login.
     * We'll keep it as-is to handle the email-based login flow.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<User> user = repo.findByEmail(email);

        if (user.isEmpty()) {
            System.out.println("User not found with email: " + email);
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        return new UserPrincipal(user.get());
    }

    /**
     * This new method is specifically for loading a user by their username.
     * It is intended to be used by the JWTFilter to validate the token.
     */
    public UserDetails loadUserByTokenUsername(String username) throws UsernameNotFoundException {
        User user = repo.findByUsername(username);

        if (user == null) {
            System.out.println("User not found with username: " + username);
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return new UserPrincipal(user);
    }
}