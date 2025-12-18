package com.unijob.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "vacancies")

public class Vacancy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private String type;
    private boolean active = true;

    @ManyToOne
    private Employer employer;

    @OneToMany(mappedBy = "vacancy". cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<VacancySkill> vacancySkills = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle(){
        return title;
    }

    public void setTitle(String title){
        this.title = title;
    }

    public String getDescription(){
        return description;
    }

    public void setDescription(String description){
        this.description = description;
    }

    public String getType(){
        return type;
    }

    public void setType(String type){
        this.type = type;
    }

    public boolean isActive(){
        return active;
    }

    public void setActive(boolean active){
        this.active = active;
    }

    private LocalDateTime createdAt = LocalDateTime.now();

    public Employer getEmployer(){
        return employer;
    }

    public void setEmployer(Employer employer) {
        this.employer = employer;
    }

    public LocalDateTime getCreatedAt(){
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
