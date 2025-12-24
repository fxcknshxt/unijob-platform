package com.unijob.platform.controller;

import com.unijob.platform.entity.UserSkill;
import com.unijob.platform.entity.User;
import com.unijob.platform.entity.Skill;
import com.unijob.platform.repository.UserSkillRepository;
import com.unijob.platform.repository.UserRepository;
import com.unijob.platform.repository.SkillRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/user-skills")
@Tag(name = "09. Навыки пользователей", description = "Управление связями пользователь-навык")
public class UserSkillController {

    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public UserSkillController(UserSkillRepository userSkillRepository,
                               UserRepository userRepository,
                               SkillRepository skillRepository) {
        this.userSkillRepository = userSkillRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    @GetMapping
    @Operation(summary = "Получить все связи пользователь-навык")
    public List<UserSkill> getAll() {
        return userSkillRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Получить навыки конкретного пользователя")
    public List<Map<String, Object>> getUserSkills(@PathVariable Long userId) {
        return userSkillRepository.findAll().stream()
                .filter(us -> us.getUser() != null && us.getUser().getId().equals(userId))
                .map(us -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", us.getId());
                    if (us.getSkill() != null) {
                        result.put("skillId", us.getSkill().getId());
                        result.put("skillName", us.getSkill().getName());
                    }
                    return result;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @PostMapping
    @Operation(summary = "Добавить навык пользователю")
    public UserSkill addSkillToUser(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long skillId = request.get("skillId");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Навык не найден"));

        boolean alreadyExists = userSkillRepository.findAll().stream()
                .anyMatch(us -> us.getUser().getId().equals(userId) &&
                        us.getSkill().getId().equals(skillId));

        if (alreadyExists) {
            throw new RuntimeException("У пользователя уже есть этот навык");
        }

        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(skill);

        return userSkillRepository.save(userSkill);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить связь пользователь-навык")
    public Map<String, String> delete(@PathVariable Long id) {
        userSkillRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Связь удалена");
        response.put("id", id.toString());
        return response;
    }
}