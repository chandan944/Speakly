package com.Backend.features.quizes.repository;



import com.Backend.features.quizes.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {}
