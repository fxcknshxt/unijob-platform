package com.unijob.platform.controller;

import com.unijob.platform.entity.Employer;
import com.unijob.platform.entity.Vacancy;
import com.unijob.platform.repository.EmployerRepository;
import com.unijob.platform.repository.VacancyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employers")
@Tag(name = "05. Работодатели", description = "Информация о работодателях и их вакансиях")
public class EmployerController {

    private final EmployerRepository employerRepository;
    private final VacancyRepository vacancyRepository;

    public EmployerController(EmployerRepository employerRepository,
                              VacancyRepository vacancyRepository) {
        this.employerRepository = employerRepository;
        this.vacancyRepository = vacancyRepository;
    }

    @GetMapping
    @Operation(summary = "Получить всех работодателей")
    public List<Employer> getAll() {
        return employerRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить работодателя по ID")
    public Employer getById(@PathVariable Long id) {
        return employerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Работодатель не найден"));
    }

    @GetMapping("/{id}/vacancies")
    @Operation(summary = "Получить вакансии работодателя")
    public List<Vacancy> getEmployerVacancies(@PathVariable Long id) {
        Employer employer = employerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Работодатель не найден"));
        return vacancyRepository.findAll().stream()
                .filter(v -> v.getEmployer() != null && v.getEmployer().getId().equals(id))
                .collect(Collectors.toList());
    }

    @PostMapping("/{id}/vacancies")
    @Operation(summary = "Создать вакансию для работодателя")
    public Vacancy createVacancy(@PathVariable Long id, @RequestBody Vacancy vacancy) {
        Employer employer = employerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Работодатель не найден"));
        vacancy.setEmployer(employer);
        return vacancyRepository.save(vacancy);
    }
}