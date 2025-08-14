package com.Backend.features.quizes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class QuestionDTO {
    @NotBlank(message = "Question text is required")
    public String questionText;

    @NotBlank(message = "Option A is required")
    public String optionA;

    @NotBlank(message = "Option B is required")
    public String optionB;

    @NotBlank(message = "Option C is required")
    public String optionC;

    @NotBlank(message = "Option D is required")
    public String optionD;

    @Pattern(regexp = "^[a-dA-D]$", message = "Correct option must be a, b, c, or d")
    public String correctOption;

    @NotBlank(message = "Explanation is required")
    public String explanation;
}