package com.Backend.configuration;

import com.Backend.features.authentication.model.User;
import com.Backend.features.authentication.repository.UserRepository;
import com.Backend.features.authentication.utils.Encoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class BackendConfiguration {

    private final Encoder encoder;
    private static final Logger log = LoggerFactory.getLogger(BackendConfiguration.class); // 🔥 Logger added

    public BackendConfiguration(Encoder encoder) {
        this.encoder = encoder;
    }

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByEmail("user@example.com").isEmpty()) {
                User user = new User("user@example.com", encoder.encode("user123"));

                // ✅ Add logs here
                log.info("Creating user with email: {}", user.getEmail());
                log.info("Encoded password: {}", user.getPassword());

                userRepository.save(user);
            }
        };
    }
}
