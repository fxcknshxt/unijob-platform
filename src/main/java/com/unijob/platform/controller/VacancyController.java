package com.unijob.platform.controller;

import java.util.List;
import com.unijob.platform.entity.Vacancy;
import com.unijob.platform.repository.VacancyRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vacancies")

public class VacancyController {

    private final VacancyRepository vacancyRepository;

    public VacancyController(VacancyRepository vacancyRepository){
        this.vacancyRepository = vacancyRepository;
    }

    @GetMapping
    public List<Vacancy> getAll(){
        return vacancyRepository.findAll();
    }

    @GetMapping("/{id}")
    public Vacancy getOne(@PathVariable Long id){
        return vacancyRepository.findById(id).orElseThrow();
    }
}