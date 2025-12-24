package com.unijob.platform.repository;

import com.unijob.platform.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTargetId(Long targetId);
    List<Review> findByAuthorId(Long authorId);
    List<Review> findByApplicationId(Long applicationId);
}