package com.unijob.platform.controller;

import com.unijob.platform.entity.Review;
import com.unijob.platform.entity.User;
import com.unijob.platform.entity.Application;
import com.unijob.platform.repository.ReviewRepository;
import com.unijob.platform.repository.UserRepository;
import com.unijob.platform.repository.ApplicationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Отзывы", description = "Система отзывов и рейтингов")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    public ReviewController(ReviewRepository reviewRepository,
                            UserRepository userRepository,
                            ApplicationRepository applicationRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
    }

    public static class ReviewRequest {
        private Long authorId;
        private Long targetId;
        private Long applicationId;
        private Integer rating;
        private String comment;

        public Long getAuthorId() { return authorId; }
        public void setAuthorId(Long authorId) { this.authorId = authorId; }

        public Long getTargetId() { return targetId; }
        public void setTargetId(Long targetId) { this.targetId = targetId; }

        public Long getApplicationId() { return applicationId; }
        public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    @GetMapping
    @Operation(summary = "Получить все отзывы")
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить отзыв по ID")
    public ResponseEntity<Review> getReviewById(@PathVariable Long id) {
        return reviewRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Создать новый отзыв")
    public ResponseEntity<?> createReview(@RequestBody ReviewRequest request) {
        try {
            if (request.getRating() < 1 || request.getRating() > 5) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Рейтинг должен быть от 1 до 5"));
            }

            User author = userRepository.findById(request.getAuthorId())
                    .orElseThrow(() -> new RuntimeException("Автор не найден"));

            User target = userRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Целевой пользователь не найден"));

            Application application = applicationRepository.findById(request.getApplicationId())
                    .orElseThrow(() -> new RuntimeException("Заявка не найдена"));

            boolean alreadyReviewed = reviewRepository.findAll().stream()
                    .anyMatch(r -> r.getAuthor().getId().equals(request.getAuthorId()) &&
                            r.getApplication().getId().equals(request.getApplicationId()));

            if (alreadyReviewed) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Вы уже оставляли отзыв на эту заявку"));
            }

            Review review = new Review();
            review.setAuthor(author);
            review.setTarget(target);
            review.setApplication(application);
            review.setRating(request.getRating());
            review.setText(request.getComment());
            review.setCreatedAt(LocalDateTime.now());

            Review savedReview = reviewRepository.save(review);

            return ResponseEntity.ok(savedReview);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Получить отзывы о пользователе")
    public List<Review> getReviewsForUser(@PathVariable Long userId) {
        return reviewRepository.findAll().stream()
                .filter(r -> r.getTarget() != null && r.getTarget().getId().equals(userId))
                .collect(Collectors.toList());
    }

    @GetMapping("/user/{userId}/average")
    @Operation(summary = "Получить средний рейтинг пользователя")
    public Map<String, Object> getAverageRating(@PathVariable Long userId) {
        List<Review> reviews = getReviewsForUser(userId);

        if (reviews.isEmpty()) {
            return Map.of(
                    "userId", userId,
                    "averageRating", 0.0,
                    "totalReviews", 0,
                    "message", "Нет отзывов"
            );
        }

        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        // Распределение по звездам
        Map<Integer, Long> ratingDistribution = reviews.stream()
                .collect(Collectors.groupingBy(Review::getRating, Collectors.counting()));

        return Map.of(
                "userId", userId,
                "averageRating", Math.round(average * 10) / 10.0, // Округление до 1 знака
                "totalReviews", reviews.size(),
                "ratingDistribution", ratingDistribution,
                "lastReview", reviews.stream()
                        .max(Comparator.comparing(Review::getCreatedAt))
                        .map(r -> Map.of(
                                "id", r.getId(),
                                "date", r.getCreatedAt(),
                                "rating", r.getRating()
                        ))
                        .orElse(null)
        );
    }

    @GetMapping("/application/{applicationId}")
    @Operation(summary = "Получить отзывы по заявке")
    public List<Review> getReviewsForApplication(@PathVariable Long applicationId) {
        return reviewRepository.findAll().stream()
                .filter(r -> r.getApplication() != null &&
                        r.getApplication().getId().equals(applicationId))
                .collect(Collectors.toList());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить отзыв")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        if (!reviewRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        reviewRepository.deleteById(id);

        return ResponseEntity.ok(Map.of(
                "message", "Отзыв удален",
                "id", id
        ));
    }

    @GetMapping("/stats")
    @Operation(summary = "Статистика отзывов")
    public Map<String, Object> getReviewStats() {
        List<Review> allReviews = reviewRepository.findAll();

        if (allReviews.isEmpty()) {
            return Map.of(
                    "totalReviews", 0,
                    "averageRating", 0.0,
                    "message", "Нет отзывов в системе"
            );
        }

        double globalAverage = allReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        Map<Long, Long> userReviewCount = allReviews.stream()
                .filter(r -> r.getTarget() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getTarget().getId(),
                        Collectors.counting()
                ));

        List<Map<String, Object>> topUsers = userReviewCount.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Long userId = entry.getKey();
                    Long count = entry.getValue();
                    double userAvg = allReviews.stream()
                            .filter(r -> r.getTarget() != null && r.getTarget().getId().equals(userId))
                            .mapToInt(Review::getRating)
                            .average()
                            .orElse(0.0);

                    return Map.<String, Object>of(
                            "userId", userId,
                            "reviewCount", count,
                            "averageRating", Math.round(userAvg * 10) / 10.0
                    );
                })
                .collect(Collectors.toList());

        return Map.of(
                "totalReviews", allReviews.size(),
                "globalAverageRating", Math.round(globalAverage * 10) / 10.0,
                "topRatedUsers", topUsers,
                "reviewsByRating", allReviews.stream()
                        .collect(Collectors.groupingBy(
                                Review::getRating,
                                Collectors.counting()
                        ))
        );
    }
}