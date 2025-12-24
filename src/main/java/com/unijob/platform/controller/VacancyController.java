package com.unijob.platform.controller;

import java.util.List;
import com.unijob.platform.entity.Vacancy;
import com.unijob.platform.repository.VacancyRepository;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vacancies")
@Tag(name = "01. Вакансии", description = "Поиск и просмотр вакансий")
public class VacancyController {

    private final VacancyRepository vacancyRepository;

    public VacancyController(VacancyRepository vacancyRepository) {
        this.vacancyRepository = vacancyRepository;
    }

    @GetMapping
    @Operation(
            summary = "Получить все вакансии (с фильтрацией)",
            description = "Возвращает список вакансий. Можно фильтровать по типу и названию"
    )
    @ApiResponse(responseCode = "200", description = "Успешно")
    public List<Vacancy> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String title) {

        if (type != null && !type.isEmpty()) {
            return vacancyRepository.findByType(type);
        }

        if (title != null && !title.isEmpty()) {
            return vacancyRepository.findByTitleContainingIgnoreCase(title);
        }

        return vacancyRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Получить вакансию по ID",
            description = "Находит вакансию по её уникальному идентификатору"
    )
    @ApiResponse(responseCode = "200", description = "Вакансия найдена")
    @ApiResponse(responseCode = "404", description = "Вакансия не найдена")
    public Vacancy getOne(@PathVariable Long id) {
        return vacancyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Вакансия с ID " + id + " не найдена"));
    }

    @GetMapping("/search")
    @Operation(summary = "Расширенный поиск вакансий")
    public List<Vacancy> searchVacancies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Long employerId) {

        return vacancyRepository.findAll().stream()
                .filter(v -> title == null || v.getTitle().toLowerCase().contains(title.toLowerCase()))
                .filter(v -> type == null || v.getType().equals(type))
                .filter(v -> location == null || (v.getLocation() != null && v.getLocation().contains(location)))
                .filter(v -> active == null || v.isActive() == active)
                .filter(v -> employerId == null || (v.getEmployer() != null && v.getEmployer().getId().equals(employerId)))
                .collect(Collectors.toList());
    }

}