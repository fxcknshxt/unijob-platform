package com.unijob.platform.controller;

import com.unijob.platform.entity.Resume;
import com.unijob.platform.entity.User;
import com.unijob.platform.repository.ResumeRepository;
import com.unijob.platform.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@Tag(name = "06. Резюме", description = "Управление резюме студентов")
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    public ResumeController(ResumeRepository resumeRepository,
                            UserRepository userRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Получить все резюме")
    public List<Resume> getAll() {
        return resumeRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Получить резюме пользователя")
    public Resume getByUserId(@PathVariable Long userId) {
        return resumeRepository.findAll().stream()
                .filter(r -> r.getStudent() != null && r.getStudent().getId().equals(userId))
                .findFirst()
                .orElse(null); // Можно вернуть пустое резюме
    }

    @PostMapping("/user/{userId}")
    @Operation(summary = "Создать или обновить резюме")
    public Resume createOrUpdateResume(@PathVariable Long userId, @RequestBody String resumeText) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // Ищем существующее резюме
        Resume resume = resumeRepository.findAll().stream()
                .filter(r -> r.getStudent() != null && r.getStudent().getId().equals(userId))
                .findFirst()
                .orElse(new Resume());

        resume.setStudent(user);
        resume.setText(resumeText);

        return resumeRepository.save(resume);
    }
}