package com.Backend.features.quizes.controller;



import com.Backend.features.quizes.dto.QuizDTO;
import com.Backend.features.quizes.entity.Quiz;
import com.Backend.features.quizes.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "http://localhost:3000") // Adjust for your React app
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Quiz createQuiz(@Valid @RequestBody QuizDTO quizDTO) {
        return quizService.createQuiz(quizDTO);
    }

    @GetMapping
    public List<Quiz> getAllQuizzes() {
        return (List<Quiz>) quizService.getAllQuizzes();
    }

    @GetMapping("/{id}")
    public Quiz getQuiz(@PathVariable Long id) {
        return quizService.getQuizById(id);
    }

    @PutMapping("/{id}")
    public Quiz updateQuiz(@PathVariable Long id, @Valid @RequestBody QuizDTO quizDTO) {
        return quizService.updateQuiz(id, quizDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
    }
}