package com.unijob.platform.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne
    @JoinColumn(name = "target_id")
    private User target;

    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;

    private Integer rating;
    private String text;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Review(){}

    public Review(User author, User target, Application application, Integer rating, String text){

        this.author = author;
        this.target = target;
        this.application = application;
        this.rating = rating;
        this.text = text;

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public User getTarget() {
        return target;
    }

    public void setTarget(User target) {
        this.target = target;
    }

    public Application getApplication(){
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        if(rating < 1 || rating > 5){
            throw new IllegalArgumentException("Рейтинг должен быть между 1 и 5");
        }
        this.rating = rating;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
