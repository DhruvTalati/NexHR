package net.javaguides.springboot.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import net.javaguides.springboot.dto.AuthResponse;
import net.javaguides.springboot.dto.LoginRequest;
import net.javaguides.springboot.dto.RegisterRequest;
import net.javaguides.springboot.entity.User;
import net.javaguides.springboot.entity.enums.Role;
import net.javaguides.springboot.exception.BadRequestException;
import net.javaguides.springboot.exception.DuplicateUserException;
import net.javaguides.springboot.repository.UserRepository;
import net.javaguides.springboot.security.JwtUtil;
import net.javaguides.springboot.service.impl.AuthServiceImpl;

/**
 * Covers the two security-critical rules in this class: self-registration
 * can never create anything but an EMPLOYEE account, and failed login never
 * leaks whether the email or the password was wrong.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(userRepository, passwordEncoder, authenticationManager, jwtUtil);
    }

    @Test
    void register_alwaysAssignsEmployeeRole_regardlessOfAnythingElse() {
        RegisterRequest request = new RegisterRequest();
        request.setName("New Hire");
        request.setEmail("newhire@example.com");
        request.setPassword("StrongPass123");

        when(userRepository.existsByEmail("newhire@example.com")).thenReturn(false);
        when(passwordEncoder.encode("StrongPass123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("fake-jwt");

        AuthResponse response = authService.register(request);

        assertThat(response.getRole()).isEqualTo(Role.EMPLOYEE.name());
        assertThat(response.getToken()).isEqualTo("fake-jwt");
    }

    @Test
    void register_rejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");
        request.setPassword("StrongPass123");
        request.setName("Someone");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateUserException.class);
    }

    @Test
    void login_withBadCredentials_throwsGenericMessage_notRevealingWhichFieldWasWrong() {
        LoginRequest request = new LoginRequest();
        request.setEmail("ada@example.com");
        request.setPassword("wrong-password");

        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad creds"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Invalid email or password");
    }
}
