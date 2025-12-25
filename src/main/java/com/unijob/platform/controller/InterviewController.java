package com.unijob.platform.controller;

import com.unijob.platform.entity.Interview;
import com.unijob.platform.entity.Application;
import com.unijob.platform.repository.InterviewRepository;
import com.unijob.platform.repository.ApplicationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interviews")
@Tag(name = "Собеседования", description = "Управление календарём собеседований")
public class InterviewController {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;

    public InterviewController(InterviewRepository interviewRepository,
                               ApplicationRepository applicationRepository) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
    }

    @GetMapping
    @Operation(summary = "Получить все собеседования")
    public List<Interview> getAll() {
        return interviewRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить собеседование по ID")
    public ResponseEntity<Interview> getById(@PathVariable Long id) {
        return interviewRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Создать новое собеседование")
    public ResponseEntity<?> create(@RequestBody InterviewRequest request) {
        try {
            Application application = applicationRepository.findById(request.getApplicationId())
                    .orElseThrow(() -> new RuntimeException("Заявка не найдена"));

            Interview interview = new Interview();
            interview.setApplication(application);
            interview.setInterviewDate(request.getInterviewDate());
            interview.setLocation(request.getLocation());
            interview.setInterviewType(request.getInterviewType());
            interview.setStatus("SCHEDULED");
            interview.setNotes(request.getNotes());

            Interview saved = interviewRepository.save(interview);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Получить собеседования пользователя")
    public List<Interview> getUserInterviews(@PathVariable Long userId) {
        List<Long> applicationIds = applicationRepository.findAll().stream()
                .filter(app -> app.getStudent() != null && app.getStudent().getId().equals(userId))
                .map(Application::getId)
                .collect(Collectors.toList());

        return interviewRepository.findAll().stream()
                .filter(interview -> applicationIds.contains(interview.getApplication().getId()))
                .collect(Collectors.toList());
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Получить предстоящие собеседования")
    public List<Interview> getUpcomingInterviews() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekLater = now.plusWeeks(1);

        return interviewRepository.findAll().stream()
                .filter(i -> i.getInterviewDate() != null)
                .filter(i -> i.getInterviewDate().isAfter(now))
                .filter(i -> i.getInterviewDate().isBefore(weekLater))
                .filter(i -> "SCHEDULED".equals(i.getStatus()))
                .sorted(Comparator.comparing(Interview::getInterviewDate))
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Изменить статус собеседования")
    public Interview updateStatus(@PathVariable Long id, @RequestParam String status) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Собеседование не найдено"));

        interview.setStatus(status);
        return interviewRepository.save(interview);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить собеседование")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!interviewRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        interviewRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Собеседование удалено", "id", id));
    }

    public static class InterviewRequest {
        private Long applicationId;
        private LocalDateTime interviewDate;
        private String location;
        private String interviewType;
        private String notes;

        public Long getApplicationId() { return applicationId; }
        public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

        public LocalDateTime getInterviewDate() { return interviewDate; }
        public void setInterviewDate(LocalDateTime interviewDate) { this.interviewDate = interviewDate; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public String getInterviewType() { return interviewType; }
        public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}