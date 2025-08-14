package com.Backend.features.quizes.repository;


import com.Backend.features.quizes.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    void deleteByQuizId(Long quizId);
}