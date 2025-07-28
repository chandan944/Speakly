package com.Backend.configuration;

import com.Backend.features.authentication.model.User;
import com.Backend.features.authentication.repository.UserRepository;
import com.Backend.features.authentication.utils.Encoder;

import com.github.javafaker.Faker;  // ✅ Keep this one
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.*;

@Configuration
public class BackendConfiguration {

    private final Encoder encoder;
    private static final Logger log = LoggerFactory.getLogger(BackendConfiguration.class);

    public BackendConfiguration(Encoder encoder) {
        this.encoder = encoder;
    }

    // ❌ DELETE this line: import com.github.javafaker.Faker;

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            Faker faker = new Faker(new Random(42));

            for (int i = 1; i <= 50; i++) {
                String firstName = faker.name().firstName();
                String lastName = faker.name().lastName();
                String email = (firstName + "." + lastName + i + "@mail.com").toLowerCase();

                if (userRepository.findByEmail(email).isEmpty()) {
                    User user = new User(email, encoder.encode("user123"));

                    user.setFirstName(firstName);
                    user.setLastName(lastName);
                    user.setEmailVerified(true);
                    user.setProfession(faker.job().title());
                    user.setLocation(faker.country().name());
                    user.setProfilePicture("https://api.dicebear.com/7.x/adventurer/svg?seed=" + firstName + i);
                    user.setBio(faker.company().catchPhrase());

                    user.updateProfileComplete();

                    userRepository.save(user);

                    log.info("✅ Created user: {} {} ({})", firstName, lastName, email);
                } else {
                    log.info("⚠️ Skipping existing email: {}", email);
                }
            }
        };
    }
}