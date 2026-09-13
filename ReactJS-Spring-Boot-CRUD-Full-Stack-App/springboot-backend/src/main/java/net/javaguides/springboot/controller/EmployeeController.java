package net.javaguides.springboot.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import net.javaguides.springboot.dto.EmployeeRequestDto;
import net.javaguides.springboot.dto.EmployeeResponseDto;
import net.javaguides.springboot.dto.PageResponseDto;
import net.javaguides.springboot.entity.enums.Department;
import net.javaguides.springboot.entity.enums.EmployeeStatus;
import net.javaguides.springboot.service.EmployeeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Handles HTTP concerns only: routing, request/response shape, status
 * codes, authorization rules. All business logic lives in EmployeeService.
 * CORS is configured centrally in CorsConfig, not per-controller.
 */
@Tag(name = "Employees", description = "Employee CRUD, search, filter, and self-service profile access")
@RestController
@RequestMapping("/api/v1/")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @Operation(summary = "List employees (paginated, sortable)")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @GetMapping("/employees")
    public PageResponseDto<EmployeeResponseDto> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        return employeeService.getAllEmployees(page, size, sortBy, sortDirection);
    }

    @Operation(summary = "Free-text search across first name, last name, and email")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @GetMapping("/employees/search")
    public PageResponseDto<EmployeeResponseDto> searchEmployees(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return employeeService.searchEmployees(keyword, page, size);
    }

    @Operation(summary = "Filter employees by any combination of name, email, department, designation, status")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @GetMapping("/employees/filter")
    public PageResponseDto<EmployeeResponseDto> filterEmployees(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Department department,
            @RequestParam(required = false) String designation,
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return employeeService.filterEmployees(name, email, department, designation, status, page, size);
    }

    @Operation(summary = "Get the authenticated user's own employee profile")
    @GetMapping("/employees/me")
    public ResponseEntity<EmployeeResponseDto> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(employeeService.getEmployeeByEmail(authentication.getName()));
    }

    @Operation(summary = "Get a single employee by id")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @GetMapping("/employees/{id}")
    public ResponseEntity<EmployeeResponseDto> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @Operation(summary = "Create a new employee")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @PostMapping("/employees")
    public ResponseEntity<EmployeeResponseDto> createEmployee(@Valid @RequestBody EmployeeRequestDto employeeRequestDto) {
        EmployeeResponseDto created = employeeService.createEmployee(employeeRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Update an existing employee")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @PutMapping("/employees/{id}")
    public ResponseEntity<EmployeeResponseDto> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeRequestDto employeeRequestDto) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, employeeRequestDto));
    }

    @Operation(summary = "Delete an employee")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
