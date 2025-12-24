package com.unijob.platform.repository;

import com.unijob.platform.entity.Vacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VacancyRepository extends JpaRepository<Vacancy, Long> {
    List<Vacancy> findByType(String type);
    List<Vacancy> findByTitleContainingIgnoreCase(String title);
}
