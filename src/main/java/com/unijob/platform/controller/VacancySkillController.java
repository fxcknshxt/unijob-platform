package com.unijob.platform.controller;

import com.unijob.platform.entity.VacancySkill;
import com.unijob.platform.entity.Vacancy;
import com.unijob.platform.entity.Skill;
import com.unijob.platform.repository.VacancySkillRepository;
import com.unijob.platform.repository.VacancyRepository;
import com.unijob.platform.repository.SkillRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/vacancy-skills")
@Tag(name = "10. Навыки вакансий", description = "Управление связями вакансия-навык")
public class VacancySkillController {

    private final VacancySkillRepository vacancySkillRepository;
    private final VacancyRepository vacancyRepository;
    private final SkillRepository skillRepository;

    public VacancySkillController(VacancySkillRepository vacancySkillRepository,
                                  VacancyRepository vacancyRepository,
                                  SkillRepository skillRepository) {
        this.vacancySkillRepository = vacancySkillRepository;
        this.vacancyRepository = vacancyRepository;
        this.skillRepository = skillRepository;
    }

    @GetMapping
    @Operation(summary = "Получить все связи вакансия-навык")
    public List<VacancySkill> getAll() {
        return vacancySkillRepository.findAll();
    }

    @GetMapping("/vacancy/{vacancyId}")
    @Operation(summary = "Получить навыки конкретной вакансии")
    public List<Map<String, Object>> getVacancySkills(@PathVariable Long vacancyId) {
        return vacancySkillRepository.findAll().stream()
                .filter(vs -> vs.getVacancy() != null && vs.getVacancy().getId().equals(vacancyId))
                .map(vs -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", vs.getId());
                    if (vs.getSkill() != null) {
                        result.put("skillId", vs.getSkill().getId());
                        result.put("skillName", vs.getSkill().getName());
                    }
                    return result;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @PostMapping
    @Operation(summary = "Добавить навык к вакансии")
    public VacancySkill addSkillToVacancy(@RequestBody Map<String, Long> request) {
        Long vacancyId = request.get("vacancyId");
        Long skillId = request.get("skillId");

        Vacancy vacancy = vacancyRepository.findById(vacancyId)
                .orElseThrow(() -> new RuntimeException("Вакансия не найдена"));
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Навык не найден"));

        boolean alreadyExists = vacancySkillRepository.findAll().stream()
                .anyMatch(vs -> vs.getVacancy().getId().equals(vacancyId) &&
                        vs.getSkill().getId().equals(skillId));

        if (alreadyExists) {
            throw new RuntimeException("У вакансии уже есть этот навык");
        }

        VacancySkill vacancySkill = new VacancySkill();
        vacancySkill.setVacancy(vacancy);
        vacancySkill.setSkill(skill);

        return vacancySkillRepository.save(vacancySkill);
    }
}