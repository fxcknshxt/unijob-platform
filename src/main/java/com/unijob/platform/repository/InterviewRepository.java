package com.unijob.platform.repository;

import com.unijob.platform.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationId(Long applicationId);
    List<Interview> findByInterviewDateBetween(LocalDateTime start, LocalDateTime end);
    List<Interview> findByStatus(String status);
}