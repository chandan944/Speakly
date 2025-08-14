package com.Backend.features.quizes.dto;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class QuizDTO {
    @NotBlank(message = "Photo URL is required")
    public String photoUrl;

    @NotBlank(message = "Caption is required")
    public String caption;

    @Valid
    @Size(min = 10, max = 10, message = "Exactly 10 questions are required")
    public List<QuestionDTO> questions;
}