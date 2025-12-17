package com.unijob.platform.controller;

import java.util.List;
import com.unijob.platform.entity.User;
import com.unijob.platform.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")

public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getAll(){
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public User getOne(@PathVariable Long id) {
        return userRepository.findById(id).orElseThrow();
    }
}