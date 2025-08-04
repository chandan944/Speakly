package com.Backend.features.authentication.model;


import com.Backend.features.feed.model.Post;
import com.Backend.features.messages.model.Conversation;
import com.Backend.features.network.model.Connection;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.NoArgsConstructor;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;

import java.time.LocalDateTime;
import java.util.List;


@Entity(name="users")
@Indexed(index = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public User() {
    }
    @FullTextField(analyzer = "standard")
    private String firstName=null ;
    @FullTextField(analyzer = "standard")
    private String lastName=null;
    private String ProfilePicture=null;
    private Boolean profileComplete=false;
    @FullTextField(analyzer = "standard")
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_hobbies", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "hobby")
    private List<String> hobbies;
    @FullTextField(analyzer = "standard")
    private String nativeLanguage = null; // replaced location
    private int points = 0; // added for leaderboard
    private String bio = "Hey there lets fun together";


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


    @JsonIgnore
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Conversation> conversationsAsAuthor;

    @JsonIgnore
    @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Conversation> conversationsAsRecipient;


    @JsonIgnore
    @OneToMany(mappedBy = "author" ,cascade = CascadeType.ALL ,orphanRemoval = true)
    private List<Post> posts;
    @JsonIgnore
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Connection> initiatedConnections;

    @JsonIgnore
    @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Connection> receivedConnections;

    public List<Connection> getInitiatedConnections() {
        return initiatedConnections;
    }

    public void setInitiatedConnections(List<Connection> initiatedConnections) {
        this.initiatedConnections = initiatedConnections;
    }

    public List<Connection> getReceivedConnections() {
        return receivedConnections;
    }

    public void setReceivedConnections(List<Connection> receivedConnections) {
        this.receivedConnections = receivedConnections;
    }

    public User(String mail, String user123) {
        this.email = mail;
        this.password = user123;
    }


    public void updateProfileComplete(){
        this.profileComplete = (this.firstName != null && this.lastName != null && this.hobbies !=null);
    }
    public Long getId() {
        return id;
    }

    public List<String> getHobbies() {
        return hobbies;
    }

    public void setHobbies(List<String> hobbies) {
        this.hobbies = hobbies;
        updateProfileComplete();
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

    public String getBio() {
        return bio;

    }

    public void setBio(String bio) {
        this.bio = bio;
        updateProfileComplete();
    }



    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public String getNativeLanguage() {
        return nativeLanguage;
    }

    public void setNativeLanguage(String nativeLanguage) {
        this.nativeLanguage = nativeLanguage;

    }
}
