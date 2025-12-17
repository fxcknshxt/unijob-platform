package com.unijob.platform.entity;

import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")

public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User student;

    @ManyToOne
    private Vacancy vacancy;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    private LocalDateTime appliedAt = LocalDateTime.now();

    public enum Status { PENDING, ACCEPTED, REJECTED }

}
