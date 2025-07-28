package com.Backend.features.authentication.controller;


import com.Backend.features.authentication.dto.AuthOauthRequest;
import com.Backend.features.authentication.dto.AuthRequest;
import com.Backend.features.authentication.dto.AuthResponse;
import com.Backend.features.authentication.model.User;
import com.Backend.features.authentication.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/authentication")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse loginPage(@Valid @RequestBody AuthRequest loginRequest){
        return authService.login(loginRequest);
    }

    @PostMapping("/register")
    public AuthResponse registerPage(@Valid @RequestBody AuthRequest registerRequest){
        return authService.register(registerRequest);
    }

    @PostMapping("oauth/google/login")
    public AuthResponse googleLogin(@RequestBody AuthOauthRequest authOauthRequest){
       return authService.googleLoginOrSignup(authOauthRequest);
    }

    @DeleteMapping("/delete")
    public String deleteUser(@RequestAttribute("authenticatedUser")User user){
        authService.deleteUser(user.getId());
        return "User deleted Successfully";
    }

    @PutMapping("/validate-email-verification-token")
    public String verifyEmail(@RequestParam String token, @RequestAttribute("authenticatedUser") User user){
        authService.validateEmailVerificationToken(token ,user.getEmail());
        return "Email verified";
    }

    @GetMapping("/send-email-verification-token")
    public String sendEmailVerificationToken(@RequestAttribute("authenticatedUser") User user){
        authService.sendEmailVerificationToken(user.getEmail());
        return "Email verification token sent successfully.";
    }
    @PutMapping("/send-password-reset-token")
    public String sendPasswordResetToken(@RequestParam String email) {
        authService.sendPasswordResetToken(email);
        return "Password reset token sent successfully.";
    }

    // 🔒 PUT /reset-password?email=...&newPassword=...&token=...
    // 🔄 Resets password using token + email
    @PutMapping("/reset-password")
    public String resetPassword(
            @RequestParam String newPassword,
            @RequestParam String token,
            @RequestParam String email) {
        authService.resetPassword(email, newPassword, token);
        return "Password reset successfully.";
    }
   @PutMapping("/profile/{id}/info")
    public User updateUserProfile(
            @PathVariable Long id,
            @RequestAttribute("authenticatedUser") User user,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String profession,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String bio
   ){
        if(!user.getId().equals(id)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN , "User don't have permission");
        }
        return authService.updateUserProfile(user,firstName,lastName,profession ,location, bio);
   }
   @PutMapping("/profile/{id}/profile-picture")
   public User updateProfilePicture(@RequestAttribute("authenticatedUser") User user,
                                    @PathVariable Long id,
                                    @RequestParam(value = "profilePicture",required = false) MultipartFile profilePicture
                                    ) throws IOException {
       if (!user.getId().equals(id)) {
           throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                   "User does not have permission to update this profile picture.");
       }

       return authService.updateProfilePicture(user, profilePicture);
    }

    @GetMapping("/users/me")
    public User getUser(@RequestAttribute("authenticatedUser") User user) {
        return user;
    }

    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        return authService.getUserById(id);
    }
}
