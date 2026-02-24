package org.yug.backend.controller;

import org.yug.backend.dto.profile.UserProfileDto;
import org.yug.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}/profile")
    public UserProfileDto getUserProfile(@PathVariable UUID id) {
        return userService.getUserProfile(id);
    }
}
