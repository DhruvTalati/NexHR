package net.javaguides.springboot.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.javaguides.springboot.dto.UpdateUserRoleRequest;
import net.javaguides.springboot.dto.UserResponseDto;
import net.javaguides.springboot.entity.User;
import net.javaguides.springboot.exception.UserNotFoundException;
import net.javaguides.springboot.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * ADMIN-only user account management. Kept intentionally small: listing
 * accounts and changing roles, which is the minimum needed to grant HR
 * access to a newly self-registered EMPLOYEE account without ever letting
 * users elevate themselves.
 */
@Tag(name = "Users", description = "Admin-only user account management")
@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Operation(summary = "List all user accounts")
    @GetMapping
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Operation(summary = "Change a user's role")
    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponseDto> updateRole(@PathVariable Long id, @Valid @RequestBody UpdateUserRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id : " + id));
        user.setRole(request.getRole());
        User saved = userRepository.save(user);
        return ResponseEntity.ok(toDto(saved));
    }

    private UserResponseDto toDto(User user) {
        return new UserResponseDto(user.getId(), user.getName(), user.getEmail(),
                user.getRole().name(), user.isEnabled(), user.getCreatedAt());
    }
}
