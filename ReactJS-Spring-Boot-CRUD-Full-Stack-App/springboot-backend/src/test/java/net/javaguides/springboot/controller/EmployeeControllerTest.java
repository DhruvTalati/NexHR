package net.javaguides.springboot.controller;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import net.javaguides.springboot.config.CorsConfig;
import net.javaguides.springboot.config.SecurityConfig;
import net.javaguides.springboot.dto.EmployeeRequestDto;
import net.javaguides.springboot.dto.EmployeeResponseDto;
import net.javaguides.springboot.entity.enums.Department;
import net.javaguides.springboot.entity.enums.EmployeeStatus;
import net.javaguides.springboot.entity.enums.EmploymentType;
import net.javaguides.springboot.exception.EmployeeNotFoundException;
import net.javaguides.springboot.security.CustomUserDetailsService;
import net.javaguides.springboot.security.JwtAuthenticationFilter;
import net.javaguides.springboot.service.EmployeeService;

/**
 * Verifies HTTP-layer behavior: the validation error shape matches the
 * project's documented contract, status codes are correct, and endpoints
 * are actually locked down by role - not just "does it return 200".
 */
@WebMvcTest(EmployeeController.class)
@Import({SecurityConfig.class, CorsConfig.class})
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeService employeeService;

    // Security beans required to load the web context, even though the JWT
    // filter itself isn't exercised in @WebMvcTest (auth is simulated via @WithMockUser).
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void createEmployee_withMissingFields_returns400WithFieldErrors() throws Exception {
        EmployeeRequestDto invalid = new EmployeeRequestDto(); // everything null

        mockMvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors.firstName").exists())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void createEmployee_withValidPayload_returns201() throws Exception {
        EmployeeRequestDto valid = validRequest();
        EmployeeResponseDto response = new EmployeeResponseDto();
        response.setId(1L);
        response.setEmployeeCode("EMP-2026-ABC12345");
        response.setEmail(valid.getEmail());

        when(employeeService.createEmployee(any(EmployeeRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(valid)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.employeeCode", is("EMP-2026-ABC12345")));
    }

    @Test
    void createEmployee_withoutAuthentication_isRejected() throws Exception {
        mockMvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(authorities = "ROLE_EMPLOYEE")
    void deleteEmployee_asEmployeeRole_isForbidden() throws Exception {
        mockMvc.perform(delete("/api/v1/employees/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void getEmployeeById_whenNotFound_returns404WithMessage() throws Exception {
        when(employeeService.getEmployeeById(anyLong()))
                .thenThrow(new EmployeeNotFoundException("Employee not found with id : 99"));

        mockMvc.perform(get("/api/v1/employees/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", is("Employee not found with id : 99")));
    }

    private EmployeeRequestDto validRequest() {
        EmployeeRequestDto dto = new EmployeeRequestDto();
        dto.setFirstName("Ada");
        dto.setLastName("Lovelace");
        dto.setEmail("ada@example.com");
        dto.setPhone("+919876543210");
        dto.setDateOfBirth(LocalDate.of(1990, 1, 1));
        dto.setDateOfJoining(LocalDate.of(2020, 1, 1));
        dto.setDepartment(Department.IT);
        dto.setDesignation("Software Engineer");
        dto.setSalary(BigDecimal.valueOf(75000));
        dto.setEmploymentType(EmploymentType.FULL_TIME);
        dto.setStatus(EmployeeStatus.ACTIVE);
        return dto;
    }
}
