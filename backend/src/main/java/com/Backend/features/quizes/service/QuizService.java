package com.Backend.features.quizes.service;

import com.Backend.features.quizes.dto.QuestionDTO;
import com.Backend.features.quizes.dto.QuizDTO;
import com.Backend.features.quizes.entity.Question;
import com.Backend.features.quizes.entity.Quiz;
import com.Backend.features.quizes.repository.QuestionRepository;
import com.Backend.features.quizes.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepo;

    @Autowired
    private QuestionRepository questionRepo;

    @Transactional
    public Quiz createQuiz(QuizDTO dto) {
        Quiz quiz = new Quiz();
        quiz.setPhotoUrl(dto.photoUrl);
        quiz.setCaption(dto.caption);

        for (QuestionDTO q : dto.questions) {
            Question question = new Question();
            question.setQuestionText(q.questionText);
            question.setOptionA(q.optionA);
            question.setOptionB(q.optionB);
            question.setOptionC(q.optionC);
            question.setOptionD(q.optionD);
            question.setCorrectOption(q.correctOption);
            question.setExplanation(q.explanation);
            question.setQuiz(quiz);
            quiz.addQuestion(question);
        }

        return quizRepo.save(quiz);
    }

    public Quiz getQuizById(Long id) {
        return quizRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Quiz not found with id: " + id));
    }

    public Iterable<Quiz> getAllQuizzes() {
        return quizRepo.findAll();
    }

    @Transactional
    public Quiz updateQuiz(Long id, QuizDTO dto) {
        Quiz quiz = getQuizById(id);

        quiz.setPhotoUrl(dto.photoUrl);
        quiz.setCaption(dto.caption);

        // Remove old questions
        quiz.getQuestions().forEach(q -> q.setQuiz(null));
        questionRepo.deleteByQuizId(id);

        // Add new ones
        for (QuestionDTO q : dto.questions) {
            Question question = new Question();
            question.setQuestionText(q.questionText);
            question.setOptionA(q.optionA);
            question.setOptionB(q.optionB);
            question.setOptionC(q.optionC);
            question.setOptionD(q.optionD);
            question.setCorrectOption(q.correctOption);
            question.setExplanation(q.explanation);
            question.setQuiz(quiz);
            quiz.addQuestion(question);
        }

        return quizRepo.save(quiz);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        if (!quizRepo.existsById(id)) {
            throw new NoSuchElementException("Quiz not found with id: " + id);
        }
        quizRepo.deleteById(id);
    }
}