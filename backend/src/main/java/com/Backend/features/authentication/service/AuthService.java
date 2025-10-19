package com.Backend.features.authentication.service;

import com.Backend.features.authentication.dto.AuthOauthRequest;
import com.Backend.features.authentication.dto.AuthRequest;
import com.Backend.features.authentication.dto.AuthResponse;
import com.Backend.features.authentication.model.User;
import com.Backend.features.authentication.repository.UserRepository;
import com.Backend.features.authentication.utils.EmailService;
import com.Backend.features.authentication.utils.Encoder;
import com.Backend.features.authentication.utils.JsonWebToken;
import com.Backend.features.storage.service.StorageService;
import io.jsonwebtoken.Claims;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;

import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@Service
public class AuthService {
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private final Encoder encoder;
    private final JsonWebToken jsonWebToken;
    private final EmailService emailService;
    private final RestTemplate restTemplate;
   private final StorageService storageService;


    @PersistenceContext
    private EntityManager entityManager;
    @Value("${oauth.google.client.id}")
    private String googleClientId;
    @Value("${oauth.google.client.secret}")
    private String googleClientSecret;


    public AuthService(UserRepository userRepository, Encoder encoder, JsonWebToken jsonWebToken, EmailService emailService, RestTemplate restTemplate, StorageService storageService) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jsonWebToken = jsonWebToken;
        this.emailService = emailService;
        this.restTemplate = restTemplate;
        this.storageService = storageService;
    }


    public AuthResponse login(@Valid AuthRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.email()).orElseThrow(() -> new IllegalArgumentException("User not found."));
        if(!encoder.matches(loginRequest.password() , user.getPassword())){
            throw new IllegalArgumentException("Password is incorrect.");
        }
        String token = jsonWebToken.generateToken(loginRequest.email());
        return new AuthResponse(token, "Authentication succeeded.");
    }

    public AuthResponse register(@Valid AuthRequest registerRequest) {
        User user = userRepository.save(
                new User(
                        registerRequest.email(),
                        encoder.encode(registerRequest.password())));
        String emailVerificationToken = generateEmailVerificationToken();
        String hashedToken = encoder.encode(emailVerificationToken);
        user.setEmailVerificationToken(hashedToken);
        user.setEmailVerificationTokenExpiryDate(LocalDateTime.now().plusMinutes(2));
        user.setAsks(30);
        userRepository.save(user);

        String subject = "Email Verification for Talksy";
        String body = String.format("""
        <h2>Only one step to take full advantage of Talksy 🚀</h2>
        <p>Enter this code to verify your email:</p>
        <h3 style="color:blue;">%s</h3>
        <p><small>The code will expire in <b>%s</b> minutes.</small></p>
        """, emailVerificationToken, 2);
        try{
            emailService.sendEmail(registerRequest.email() ,subject,body);
        } catch (Exception e) {
            logger.info("Error while sending email: {}", e.getMessage());
        }
        String authToken = jsonWebToken.generateToken(registerRequest.email());
        return new AuthResponse(authToken,"User registered successfully.");
    }

    public static String generateEmailVerificationToken() {
        SecureRandom random = new SecureRandom();
        StringBuilder token = new StringBuilder(5);
        for (int i = 0; i < 5; i++) {
            token.append(random.nextInt(10));
        }
        return token.toString();
    }

    public AuthResponse googleLoginOrSignup(AuthOauthRequest authOauthRequest) {
        String tokenEndpoint = "https://oauth2.googleapis.com/token";
        String redirectUri = "https://speakly-weld.vercel.app/authentication/" + authOauthRequest.page();
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();

        body.add("code", authOauthRequest.code());
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientSecret);
        body.add("redirect_uri", redirectUri);
        body.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(tokenEndpoint, HttpMethod.POST, request,
                new ParameterizedTypeReference<>() {
                });

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Map<String, Object> responseBody = response.getBody();
            String idToken = (String) responseBody.get("id_token");

            Claims claims = jsonWebToken.getClaimsFromGoogleOauthIdToken(idToken);
            String email = claims.get("email", String.class);
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {

                Boolean emailVerified = claims.get("email_verified", Boolean.class);
                String firstName = claims.get("given_name", String.class);
                String lastName = claims.get("family_name", String.class);
                User newUser = new User(email, null);
                newUser.setEmailVerified(emailVerified);
                newUser.setFirstName(firstName);
                newUser.setLastName(lastName);
                newUser.setAsks(30);
                userRepository.save(newUser);

            }

            String token = jsonWebToken.generateToken(email);
            return new AuthResponse(token, "Google authentication succeeded.");
        } else {
            throw new IllegalArgumentException("Failed to exchange code for ID token.");
        }
    }
    @Transactional
    public void deleteUser(Long id) {
        User user = entityManager.find(User.class ,id);
        if(user != null){
            entityManager.createNativeQuery("DELETE FROM posts_likes WHERE user_id = :id")
                    .setParameter("id",id)
                    .executeUpdate();
            entityManager.remove(user);
        }

    }

    public void validateEmailVerificationToken(String token, String email) {
        Optional<User> user = userRepository.findByEmail(email);

        if(user.isPresent() && encoder.matches(token , user.get().getEmailVerificationToken())
        && !user.get().getEmailVerificationTokenExpiryDate().isBefore(LocalDateTime.now())){
            user.get().setEmailVerified(true);

            user.get().setEmailVerificationToken(null);
            user.get().setEmailVerificationTokenExpiryDate(null);

            userRepository.save(user.get());
        } else if (user.isPresent() && encoder.matches(token, user.get().getEmailVerificationToken())
                && user.get().getEmailVerificationTokenExpiryDate().isBefore(LocalDateTime.now())) {
            // ⌛ Token matched but expired
            throw new IllegalArgumentException("Email verification token expired.");
        } else {
            // ❌ Invalid or mismatched token
            throw new IllegalArgumentException("Email verification token failed.");
        }
    }

    public void sendEmailVerificationToken(String email) {
        Optional<User> user = userRepository.findByEmail(email);

        // ✅ If user exists and their email is not verified yet
        if (user.isPresent() && !user.get().getEmailVerified()) {

            // 🔢 Generate verification token (OTP-like)
            String emailVerificationToken = generateEmailVerificationToken();

            // 🔐 Hash it before saving
            String hashedToken = encoder.encode(emailVerificationToken);

            // 🗃️ Store hashed token + expiry time
            user.get().setEmailVerificationToken(hashedToken);
            user.get().setEmailVerificationTokenExpiryDate(LocalDateTime.now().plusMinutes(2));
            userRepository.save(user.get());

            // 📧 Compose and send the email
            String subject = "Email Verification";
            String body = String.format("""
                            Only one step to take full advantage of LinkedIn.
                            
                            Enter this code to verify your email: %s
                            
                            The code will expire in %s\
                             minutes.""",
                    emailVerificationToken, 2);

            try {
                emailService.sendEmail(email, subject, body);
            } catch (Exception e) {
                logger.info("Error while sending email: {}", e.getMessage());
            }

        } else {
            // ❌ Either user doesn’t exist or email is already verified
            throw new IllegalArgumentException("Email verification token failed, or email is already verified.");
        }
    }

    public void sendPasswordResetToken(String email) {
        // 🔎 Try to find user by email
        Optional<User> user = userRepository.findByEmail(email);

        // ✅ If user exists
        if (user.isPresent()) {
            // 🔢 Generate a 5-digit random token (OTP style)
            String passwordResetToken = generateEmailVerificationToken();

            // 🔐 Hash the token for security before saving to DB
            String hashedToken = encoder.encode(passwordResetToken);

            // 🗃️ Store hashed token and set expiry time (e.g., 1 min from now)
            user.get().setPasswordResetToken(hashedToken);
            user.get().setPasswordResetTokenExpiryDate(LocalDateTime.now().plusMinutes(2));
            userRepository.save(user.get());

            // ✉️ Compose email message
            String subject = "Password Reset";
            String body = String.format("""
                You requested a password reset.

                Enter this code to reset your password: %s. The code will expire in %s minutes.""",
                    passwordResetToken, 2);

            // 📬 Try sending the email
            try {
                emailService.sendEmail(email, subject, body);
            } catch (Exception e) {
                logger.info("Error while sending email: {}", e.getMessage());
            }
        } else {
            // ❌ No such user
            throw new IllegalArgumentException("User not found.");
        }
    }


    public void resetPassword(String email, String newPassword, String token) {
        Optional<User> user = userRepository.findByEmail(email);

        if(user.isPresent() && encoder.matches(token ,user.get().getPasswordResetToken()) && !user.get().getPasswordResetTokenExpiryDate().isBefore(LocalDateTime.now())){
            user.get().setPasswordResetToken(null);
            user.get().setPasswordResetTokenExpiryDate(null);
            // 🔐 Set new password (after hashing)
            user.get().setPassword(encoder.encode(newPassword));

            // 💾 Save user
            userRepository.save(user.get());
        }
     else if (user.isPresent() && encoder.matches(token, user.get().getPasswordResetToken())
            && user.get().getPasswordResetTokenExpiryDate().isBefore(LocalDateTime.now())) {
        // ⌛ Token expired
        throw new IllegalArgumentException("Password reset token expired.");
    } else {
        // ❌ Token doesn't match or user not found
        throw new IllegalArgumentException("Password reset token failed.");
    }
    }

    public User updateUserProfile(User user, String firstName, String lastName, String hobbies,String nativeLanguage, String bio) {
        if(firstName !=null)
            user.setFirstName(firstName);
        if (lastName != null)
            user.setLastName(lastName);
        if(hobbies != null)
            user.setHobbies(Collections.singletonList(hobbies));
        if(nativeLanguage != null)
            user.setNativeLanguage(nativeLanguage);
        if(bio != null)
            user.setBio(bio);

        return userRepository.save(user);
    }

    public User updateProfilePicture(User user, MultipartFile profilePicture) throws IOException {
        if (profilePicture != null) {
            String profilePictureUrl = storageService.saveImage(profilePicture);
            user.setProfilePicture(profilePictureUrl);
        } else {
            if (user.getProfilePicture() != null)
                storageService.deleteFile(user.getProfilePicture());

            user.setProfilePicture(null);
        }
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("User Not Found!") );
    }

    public User getUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(()-> new IllegalArgumentException("User Not Found!"));
    }


    public List<User> findTopUsersByPoints() {
        return userRepository.findAllByOrderByPointsDesc();
    }

    public User updatePoints(User user, Integer points, Integer asks) {

        user.setPoints(user.getPoints() + points);
        user.setAsks(user.getAsks() - asks);                           // ✅ set points properly
        return userRepository.save(user);             // ✅ return updated user
    }



    @Scheduled(cron = "0 0 */5 * * *")
    @Transactional // ← Best to put it here, on the service method
    public void addAsksEveryFiveHours() {
        userRepository.addAsksToAllUsers();
        System.out.println("✅ Bulk +1 ask to all users at " + LocalTime.now());
    }


}

