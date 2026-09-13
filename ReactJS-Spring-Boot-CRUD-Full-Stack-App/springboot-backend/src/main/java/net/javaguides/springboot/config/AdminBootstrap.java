package net.javaguides.springboot.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import net.javaguides.springboot.entity.User;
import net.javaguides.springboot.entity.enums.Role;
import net.javaguides.springboot.repository.UserRepository;

/**
 * Solves the chicken-and-egg problem of the very first ADMIN account:
 * self-registration only ever creates EMPLOYEE accounts (see
 * AuthServiceImpl), so on first startup - and only if no ADMIN exists yet -
 * this seeds one from configuration.
 *
 * Change the seeded password immediately in any environment beyond local
 * development. See README "Environment Variables".
 */
@Component
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminBootstrap(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           @Value("${app.admin.email}") String adminEmail,
                           @Value("${app.admin.password}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(Role.ADMIN)) {
            return;
        }

        User admin = new User();
        admin.setName("System Administrator");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        userRepository.save(admin);

        log.warn("No ADMIN account existed - seeded one with email '{}'. "
                + "Log in and change this password immediately, especially outside local development.", adminEmail);
    }
}
