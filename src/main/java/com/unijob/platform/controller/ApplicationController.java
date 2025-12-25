package com.unijob.platform.controller;

import java.util.List;
import java.util.Map;
import com.unijob.platform.entity.Application;
import com.unijob.platform.entity.Notification;
import com.unijob.platform.entity.User;
import com.unijob.platform.entity.Vacancy;
import com.unijob.platform.repository.ApplicationRepository;
import com.unijob.platform.repository.NotificationRepository;
import com.unijob.platform.repository.UserRepository;
import com.unijob.platform.repository.VacancyRepository;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "02. Заявки", description = "Подача и управление заявками")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final VacancyRepository vacancyRepository;

    public ApplicationController(ApplicationRepository applicationRepository,
                                 NotificationRepository notificationRepository,
                                 UserRepository userRepository,
                                 VacancyRepository vacancyRepository) {
        this.applicationRepository = applicationRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.vacancyRepository = vacancyRepository;
    }

    @GetMapping
    @Operation(summary = "Получить все заявки")
    @ApiResponse(responseCode = "200", description = "Успешно")
    public List<Application> getAll() {
        return applicationRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить заявку по ID")
    @ApiResponse(responseCode = "200", description = "Заявка найдена")
    @ApiResponse(responseCode = "404", description = "Заявка не найдена")
    public Application getOne(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заявка с ID " + id + " не найдена"));
    }

    @PostMapping
    @Operation(
            summary = "Создать новую заявку",
            description = "Подать заявку на вакансию. Требуется ID студента и ID вакансии. Автоматически создаётся уведомление."
    )
    @ApiResponse(responseCode = "200", description = "Заявка успешно создана")
    @ApiResponse(responseCode = "400", description = "Неверные данные")
    public Map<String, Object> create(@RequestBody Application app) {
        System.out.println("Подача заявки от пользователя: " + app.getStudent().getId());

        User student = userRepository.findById(app.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Студент не найден"));

        if (student.getRole() != User.Role.STUDENT){
            throw new RuntimeException("Только студенты могут подавать заявки! Роль пользователя: " + student.getRole());
        }

        Vacancy vacancy = vacancyRepository.findById(app.getVacancy().getId())
                .orElseThrow(() -> new RuntimeException("Вакансия не найдена"));

        app.setStudent(student);
        app.setVacancy(vacancy);

        if (app.getCoverLetter() == null || app.getCoverLetter().isEmpty()) {
            app.setCoverLetter("Заинтересован в данной вакансии!");
        }

        Application savedApp = applicationRepository.save(app);

        Notification notification = new Notification();
        notification.setUser(student);
        notification.setText("Вы подали заявку на вакансию: '" + vacancy.getTitle() + "'");
        notification.setRead(false);
        notificationRepository.save(notification);

        return Map.of(
                "application", savedApp,
                "notification", Map.of(
                        "id", notification.getId(),
                        "text", notification.getText(),
                        "createdAt", notification.getCreatedAt()
                ),
                "message", "Заявка подана успешно! Создано уведомление #" + notification.getId()
        );
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Изменить статус заявки")
    public Map<String, Object> updateStatus(@PathVariable Long id,
                                            @RequestParam String status) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Заявка не найдена"));

        Application.Status newStatus = Application.Status.valueOf(status);
        app.setStatus(newStatus);
        applicationRepository.save(app);

        Notification notification = new Notification();
        notification.setUser(app.getStudent());
        notification.setText("Статус вашей заявки на вакансию '" +
                app.getVacancy().getTitle() + "' изменён на: " + status);
        notification.setRead(false);
        notificationRepository.save(notification);

        return Map.of(
                "application", app,
                "notification", notification,
                "message", "Статус обновлён"
        );
    }

}