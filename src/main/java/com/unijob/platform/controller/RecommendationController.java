package com.unijob.platform.controller;

import com.unijob.platform.entity.Vacancy;
import com.unijob.platform.repository.UserSkillRepository;
import com.unijob.platform.repository.VacancySkillRepository;
import com.unijob.platform.repository.VacancyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
@Tag(name = "Рекомендации", description = "Система рекомендаций вакансий")
public class RecommendationController {

    private final UserSkillRepository userSkillRepository;
    private final VacancySkillRepository vacancySkillRepository;
    private final VacancyRepository vacancyRepository;

    public RecommendationController(UserSkillRepository userSkillRepository,
                                    VacancySkillRepository vacancySkillRepository,
                                    VacancyRepository vacancyRepository) {
        this.userSkillRepository = userSkillRepository;
        this.vacancySkillRepository = vacancySkillRepository;
        this.vacancyRepository = vacancyRepository;
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Получить рекомендации вакансий для пользователя")
    public List<Map<String, Object>> getRecommendations(@PathVariable Long userId) {
        // 1. Получаем ID навыков пользователя
        List<Long> userSkillIds = userSkillRepository.findAll().stream()
                .filter(us -> us.getUser() != null && us.getUser().getId().equals(userId))
                .filter(us -> us.getSkill() != null)
                .map(us -> us.getSkill().getId())
                .collect(Collectors.toList());

        if (userSkillIds.isEmpty()) {
            // Если у пользователя нет навыков, возвращаем случайные активные вакансии
            return vacancyRepository.findAll().stream()
                    .filter(Vacancy::isActive)
                    .limit(3)
                    .map(this::vacancyToMap)
                    .collect(Collectors.toList());
        }

        List<Vacancy> allActiveVacancies = vacancyRepository.findAll().stream()
                .filter(Vacancy::isActive)
                .collect(Collectors.toList());

        List<Map<String, Object>> recommendations = allActiveVacancies.stream()
                .map(vacancy -> {
                    // Навыки, требуемые для этой вакансии
                    List<Long> vacancySkillIds = vacancySkillRepository.findAll().stream()
                            .filter(vs -> vs.getVacancy() != null && vs.getVacancy().getId().equals(vacancy.getId()))
                            .filter(vs -> vs.getSkill() != null)
                            .map(vs -> vs.getSkill().getId())
                            .collect(Collectors.toList());

                    long matches = vacancySkillIds.stream()
                            .filter(userSkillIds::contains)
                            .count();

                    double matchPercentage = vacancySkillIds.isEmpty() ? 0 :
                            (matches * 100.0 / vacancySkillIds.size());

                    Map<String, Object> recommendation = vacancyToMap(vacancy);
                    recommendation.put("matchPercentage", Math.round(matchPercentage * 10) / 10.0);
                    recommendation.put("requiredSkills", vacancySkillIds.size());
                    recommendation.put("matchedSkills", matches);
                    recommendation.put("userSkillsCount", userSkillIds.size());

                    return recommendation;
                })
                // Сортируем по проценту совпадения (по убыванию)
                .sorted((v1, v2) -> {
                    double p1 = (double) v1.get("matchPercentage");
                    double p2 = (double) v2.get("matchPercentage");
                    return Double.compare(p2, p1); // убывание
                })
                // Берем топ-5
                .limit(5)
                .collect(Collectors.toList());

        return recommendations;
    }

    @GetMapping("/skills-for-vacancy/{vacancyId}")
    @Operation(summary = "Получить навыки, требуемые для вакансии")
    public List<Map<String, Object>> getSkillsForVacancy(@PathVariable Long vacancyId) {
        return vacancySkillRepository.findAll().stream()
                .filter(vs -> vs.getVacancy() != null && vs.getVacancy().getId().equals(vacancyId))
                .filter(vs -> vs.getSkill() != null)
                .map(vs -> {
                    Map<String, Object> skillInfo = new HashMap<>();
                    skillInfo.put("skillId", vs.getSkill().getId());
                    skillInfo.put("skillName", vs.getSkill().getName());
                    skillInfo.put("relationId", vs.getId());
                    return skillInfo;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/vacancies-for-skill/{skillId}")
    @Operation(summary = "Получить вакансии, требующие определенный навык")
    public List<Map<String, Object>> getVacanciesForSkill(@PathVariable Long skillId) {
        return vacancySkillRepository.findAll().stream()
                .filter(vs -> vs.getSkill() != null && vs.getSkill().getId().equals(skillId))
                .filter(vs -> vs.getVacancy() != null && vs.getVacancy().isActive())
                .map(vs -> {
                    Vacancy vacancy = vs.getVacancy();
                    Map<String, Object> vacancyInfo = new HashMap<>();
                    vacancyInfo.put("vacancyId", vacancy.getId());
                    vacancyInfo.put("title", vacancy.getTitle());
                    vacancyInfo.put("type", vacancy.getType());
                    vacancyInfo.put("description", vacancy.getDescription());
                    vacancyInfo.put("active", vacancy.isActive());
                    return vacancyInfo;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> vacancyToMap(Vacancy vacancy) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", vacancy.getId());
        map.put("title", vacancy.getTitle());
        map.put("description", vacancy.getDescription());
        map.put("type", vacancy.getType());
        map.put("active", vacancy.isActive());
        map.put("createdAt", vacancy.getCreatedAt());

        if (vacancy.getEmployer() != null) {
            Map<String, Object> employerInfo = new HashMap<>();
            employerInfo.put("id", vacancy.getEmployer().getId());
            employerInfo.put("companyName", vacancy.getEmployer().getCompanyName());
            map.put("employer", employerInfo);
        }

        return map;
    }
}