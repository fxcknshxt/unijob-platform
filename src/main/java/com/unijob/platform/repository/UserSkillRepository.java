package com.unijob.platform.repository;

import com.unijob.platform.entity.User;
import com.unijob.platform.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long>{
}
