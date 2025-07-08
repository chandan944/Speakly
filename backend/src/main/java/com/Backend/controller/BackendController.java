package com.Backend.controller;


import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.nio.file.NoSuchFileException;
import java.util.Map;
// 📌 Applies to all REST controllers
@ControllerAdvice

// 📦 Makes it return JSON (instead of HTML error pages)
@RestController

// 🔗 Base path (not required for exception handling — here just as route info)
@RequestMapping("/api/v1")
public class
BackendController {

    /**
     * 🧩 CASE 1: Missing Request Body
     * Example: POST /login with no JSON sent
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(
                Map.of("message", "Required request body is missing.")
        );
    }

    /**
     * 🧩 CASE 2: Validation Error (e.g. @NotBlank, @Email failed)
     * Triggered when Spring validates @RequestBody or @RequestParam fields and they’re invalid
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        StringBuilder errorMessage = new StringBuilder();

        // Loop through all field errors and collect messages
        e.getBindingResult().getFieldErrors().forEach(error -> {
            errorMessage
                    .append(error.getField())
                    .append(": ")
                    .append(error.getDefaultMessage())
                    .append("; ");
        });

        return ResponseEntity.badRequest().body(
                Map.of("message", errorMessage.toString())
        );
    }

    /**
     * 🧩 CASE 3: Custom 404 Exception
     * Example: When you throw NoResourceFoundException manually
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, String>> handleNoResourceFoundException(NoResourceFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", e.getMessage())
        );
    }

    /**
     * 🧩 CASE 4: DB Constraint Violation (e.g. unique email)
     * Example: Insert duplicate email => SQL error
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        if (e.getMessage().contains("Duplicate entry")) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email already exists, please use another email or login.")
            );
        }

        return ResponseEntity.badRequest().body(
                Map.of("message", e.getMessage())
        );
    }

    /**
     * 🧩 CASE 5: Missing Query Parameter
     * Example: /users?page=  (but page is required)
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, String>> handleMissingServletRequestParameterException(MissingServletRequestParameterException e) {
        return ResponseEntity.badRequest().body(
                Map.of("message", "Required request parameter is missing.")
        );
    }

    /**
     * 🧩 CASE 6: Bad input — Illegal arguments or logic error
     */
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(
                Map.of("message", e.getMessage())
        );
    }

    /**
     * 🧩 CASE 7: File not found error
     * Example: Trying to download a non-existing file
     */
    @ExceptionHandler(NoSuchFileException.class)
    public ResponseEntity<Map<String, String>> handleNoSuchFileException(NoSuchFileException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "File not found")
        );
    }

    /**
     * 🧩 CASE 8: Catch-all fallback
     * Any unhandled exceptions will land here
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("message", e.getMessage())
        );
    }
}
