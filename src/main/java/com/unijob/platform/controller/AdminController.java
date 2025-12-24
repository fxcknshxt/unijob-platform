package com.unijob.platform.controller;

import com.unijob.platform.entity.Application;
import com.unijob.platform.entity.Vacancy;
import com.unijob.platform.repository.ApplicationRepository;
import com.unijob.platform.repository.VacancyRepository;
import com.unijob.platform.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Администратор", description = "Панель управления для администраторов")
public class AdminController {

    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public AdminController(VacancyRepository vacancyRepository,
                           ApplicationRepository applicationRepository,
                           UserRepository userRepository) {
        this.vacancyRepository = vacancyRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Получить статистику для админ-панели")
    public Map<String, Object> getDashboardStats() {
        long totalVacancies = vacancyRepository.count();
        long totalApplications = applicationRepository.count();
        long totalUsers = userRepository.count();

        long activeVacancies = vacancyRepository.findAll().stream()
                .filter(Vacancy::isActive)
                .count();

        Map<String, Long> applicationsByStatus = getApplicationsByStatus();

        return Map.of(
                "totalVacancies", totalVacancies,
                "activeVacancies", activeVacancies,
                "totalApplications", totalApplications,
                "totalUsers", totalUsers,
                "applicationsByStatus", applicationsByStatus
        );
    }

    private Map<String, Long> getApplicationsByStatus() {
        Map<String, Long> statusCount = new HashMap<>();

        statusCount.put("PENDING", 0L);
        statusCount.put("ACCEPTED", 0L);
        statusCount.put("REJECTED", 0L);

        applicationRepository.findAll().forEach(app -> {
            String status = app.getStatus().name();
            statusCount.put(status, statusCount.getOrDefault(status, 0L) + 1);
        });

        return statusCount;
    }

    @PutMapping("/vacancies/{id}/toggle")
    @Operation(summary = "Активировать/деактивировать вакансию")
    public Vacancy toggleVacancy(@PathVariable Long id) {
        Vacancy vacancy = vacancyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Вакансия с ID " + id + " не найдена"));

        vacancy.setActive(!vacancy.isActive());
        return vacancyRepository.save(vacancy);
    }

    @DeleteMapping("/vacancies/{id}")
    @Operation(summary = "Удалить вакансию")
    public Map<String, String> deleteVacancy(@PathVariable Long id) {
        if (!vacancyRepository.existsById(id)) {
            throw new RuntimeException("Вакансия с ID " + id + " не найдена");
        }

        vacancyRepository.deleteById(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Вакансия удалена");
        response.put("id", id.toString());
        return response;
    }

    @GetMapping("/applications/recent")
    @Operation(summary = "Получить последние заявки")
    public List<Application> getRecentApplications() {
        return applicationRepository.findAll().stream()
                .sorted((a1, a2) -> a2.getAppliedAt().compareTo(a1.getAppliedAt()))
                .limit(10)
                .collect(Collectors.toList());
    }

    @GetMapping("/applications/status/{status}")
    @Operation(summary = "Получить заявки по статусу")
    public List<Application> getApplicationsByStatus(@PathVariable String status) {
        return applicationRepository.findAll().stream()
                .filter(app -> app.getStatus().name().equalsIgnoreCase(status))
                .collect(Collectors.toList());
    }

    @PutMapping("/applications/{id}/status")
    @Operation(summary = "Изменить статус заявки (для администратора)")
    public Application updateApplicationStatus(@PathVariable Long id,
                                               @RequestParam String status) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заявка с ID " + id + " не найдена"));

        try {
            Application.Status newStatus = Application.Status.valueOf(status.toUpperCase());
            application.setStatus(newStatus);
            return applicationRepository.save(application);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Неверный статус. Допустимые значения: PENDING, ACCEPTED, REJECTED");
        }
    }
}