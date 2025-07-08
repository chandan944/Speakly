package com.Backend.features.authentication.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Entity(name="users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public User() {
    }

    private String firstName=null ;
    private String lastName=null;
    private String ProfilePicture=null;
    private Boolean profileComplete=false;
    private String profession=null;


    @NotNull(message = "Email is required.")
    @Email(message = "Please enter a valid email address.")
    @Column(unique = true)
    private String email;
    private Boolean emailVerified = false;
    private String emailVerificationToken = null;
    private LocalDateTime emailVerificationTokenExpiryDate = null;


    @JsonIgnore
    @Size(min = 6, message = "Password must be at least 6 characters long.")
    private String password;
    private String passwordResetToken=null;
    private LocalDateTime passwordResetTokenExpiryDate = null;

    public User(String mail, String user123) {
        this.email = mail;
        this.password = user123;
    }


    public void updateProfileComplete(){
        this.profileComplete = (this.firstName != null && this.lastName != null && this.profession !=null);
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getEmailVerificationTokenExpiryDate() {
        return emailVerificationTokenExpiryDate;
    }

    public void setEmailVerificationTokenExpiryDate(LocalDateTime emailVerificationTokenExpiryDate) {
        this.emailVerificationTokenExpiryDate = emailVerificationTokenExpiryDate;
    }

    public String getEmailVerificationToken() {
        return emailVerificationToken;
    }

    public void setEmailVerificationToken(String emailVerificationToken) {
        this.emailVerificationToken = emailVerificationToken;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getPasswordResetToken() {
        return passwordResetToken;
    }

    public void setPasswordResetToken(String passwordResetToken) {
        this.passwordResetToken = passwordResetToken;
    }

    public String getProfilePicture() {
        return ProfilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        ProfilePicture = profilePicture;
    }

    public Boolean getProfileComplete() {
        return profileComplete;
    }

    public void setProfileComplete(Boolean profileComplete) {
        this.profileComplete = profileComplete;
    }

    public String getProfession() {
        return profession;
    }

    public void setProfession(String profession) {
        this.profession = profession;
        updateProfileComplete();
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
        updateProfileComplete();
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
        updateProfileComplete();
    }

    public LocalDateTime getPasswordResetTokenExpiryDate() {
        return passwordResetTokenExpiryDate;
    }

    public void setPasswordResetTokenExpiryDate(LocalDateTime passwordResetTokenExpiryDate) {
        this.passwordResetTokenExpiryDate = passwordResetTokenExpiryDate;
    }
}
