package com.unijob.platform.controller;

import com.unijob.platform.entity.Skill;
import com.unijob.platform.entity.UserSkill;
import com.unijob.platform.entity.VacancySkill;
import com.unijob.platform.repository.SkillRepository;
import com.unijob.platform.repository.UserSkillRepository;
import com.unijob.platform.repository.VacancySkillRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/skills")
@Tag(name = "04. Навыки", description = "Управление навыками и связями")
public class SkillController {

    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final VacancySkillRepository vacancySkillRepository;

    public SkillController(SkillRepository skillRepository,
                           UserSkillRepository userSkillRepository,
                           VacancySkillRepository vacancySkillRepository) {
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.vacancySkillRepository = vacancySkillRepository;
    }

    @GetMapping
    @Operation(summary = "Получить все навыки")
    public List<Skill> getAll() {
        return skillRepository.findAll();
    }

    @GetMapping("/{id}/users")
    @Operation(summary = "Получить пользователей с этим навыком")
    public List<Map<String, Object>> getUsersWithSkill(@PathVariable Long id) {
        return userSkillRepository.findAll().stream()
                .filter(us -> us.getSkill() != null && us.getSkill().getId().equals(id))
                .map(us -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("userId", us.getUser().getId());
                    result.put("userName", us.getUser().getName());
                    result.put("userEmail", us.getUser().getEmail());
                    return result;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}/vacancies")
    @Operation(summary = "Получить вакансии, требующие этот навык")
    public List<Map<String, Object>> getVacanciesRequiringSkill(@PathVariable Long id) {
        return vacancySkillRepository.findAll().stream()
                .filter(vs -> vs.getSkill() != null && vs.getSkill().getId().equals(id))
                .map(vs -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("vacancyId", vs.getVacancy().getId());
                    result.put("vacancyTitle", vs.getVacancy().getTitle());
                    result.put("vacancyType", vs.getVacancy().getType());
                    return result;
                })
                .collect(Collectors.toList());
    }
}