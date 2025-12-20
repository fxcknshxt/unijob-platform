package com.unijob.platform.controller;

import java.util.List;
import com.unijob.platform.entity.Application;
import com.unijob.platform.repository.ApplicationRepository;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "02. Заявки", description = "Подача и управление заявками")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;

    public ApplicationController(ApplicationRepository applicationRepository){
        this.applicationRepository = applicationRepository;
    }

    @GetMapping
    @Operation(summary = "Получить все заявки")
    @ApiResponse(responseCode = "200", description = "Успешно")
    public List<Application> getAll(){
        return applicationRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить заявку по ID")
    @ApiResponse(responseCode = "200", description = "Заявка найдена")
    @ApiResponse(responseCode = "404", description = "Заявка не найдена")
    public Application getOne(@PathVariable Long id){
        return applicationRepository.findById(id).
                orElseThrow(() -> new RuntimeException("Заявка с ID " + id + " не найдена"));
    }

    @PostMapping
    @Operation(
            summary = "Создать новую заявку",
            description = "Подать заявку на вакансию. Требуется ID студента и ID вакансии"
    )
    @ApiResponse(responseCode = "200", description = "Заявка успешно создана")
    @ApiResponse(responseCode = "404", description = "Неверные данные")
    public Application create(@RequestBody Application app) {
        return applicationRepository.save(app);
    }
}
