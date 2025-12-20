package com.unijob.platform.controller;

import java.util.List;
import com.unijob.platform.entity.Vacancy;
import com.unijob.platform.repository.VacancyRepository;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/vacancies")
@Tag(name = "01. Вакансии", description = "Поиск и просмотр вакансий")
public class VacancyController {

    private final VacancyRepository vacancyRepository;

    public VacancyController(VacancyRepository vacancyRepository){
        this.vacancyRepository = vacancyRepository;
    }

    @GetMapping
    @Operation(
            summary = "Получить все вакансии",
            description = "Возвращает список всех ваканский"
    )
    @ApiResponse(responseCode = "200", description = "Успешно")
    public List<Vacancy> getAll(){
        return vacancyRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Получить вакансию по ID",
            description = "Находит вакансию по ее уникальному идентификатору"
    )
    @ApiResponse(responseCode = "200", description = "Вакансия найдена")
    @ApiResponse(responseCode = "404", description = "Вакансия не найдена")
    public Vacancy getOne(@PathVariable Long id){
        return vacancyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ваккансия с ID " + " не найдена"));
    }
}