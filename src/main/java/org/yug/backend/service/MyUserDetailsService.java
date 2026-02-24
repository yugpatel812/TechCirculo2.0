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


    public UserDetails loadUserByUsername2(String username) throws UsernameNotFoundException {

User user = repo.findByUsername(username);
if(user == null) {
            System.out.println("User 404");
            throw new UsernameNotFoundException("User 404");
        }

        return new UserPrincipal(user);
    }
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {


        Optional<User> user= repo.findByEmail(email);

        if (user.isEmpty()) {
            System.out.println("User 404");
            throw new UsernameNotFoundException("User 404");
        }
        return new UserPrincipal(user.orElse(null));
    }

}