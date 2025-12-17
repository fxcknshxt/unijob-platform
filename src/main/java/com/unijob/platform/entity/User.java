package com.unijob.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Users")

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    //private String password;

    @Enumerated(EnumType.STRING)

    private Role role;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role { STUDENT, EMPLOYER, ADMIN}
}
