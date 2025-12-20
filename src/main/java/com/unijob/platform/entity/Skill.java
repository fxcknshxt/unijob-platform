package com.unijob.platform.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "skills")
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    private String name;

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<UserSkill> userSkills = new HashSet<>();

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<VacancySkill> vacancySkills = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<UserSkill> getUsers() {
        return userSkills;
    }

    public void setUsers(Set<UserSkill> userSkills) {
        this.userSkills = userSkills;
    }

    public Set<VacancySkill> getVacancies() {
        return vacancySkills;
    }

    public void setVacancies(Set<VacancySkill> vacancySkills) {
        this.vacancySkills = vacancySkills;
    }
}
