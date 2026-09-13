package net.javaguides.springboot.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import net.javaguides.springboot.dto.EmployeeRequestDto;
import net.javaguides.springboot.dto.EmployeeResponseDto;
import net.javaguides.springboot.entity.Employee;
import net.javaguides.springboot.entity.enums.Department;
import net.javaguides.springboot.entity.enums.EmployeeStatus;
import net.javaguides.springboot.entity.enums.EmploymentType;
import net.javaguides.springboot.exception.DuplicateEmployeeException;
import net.javaguides.springboot.exception.EmployeeNotFoundException;
import net.javaguides.springboot.mapper.EmployeeMapper;
import net.javaguides.springboot.repository.EmployeeRepository;
import net.javaguides.springboot.service.impl.EmployeeServiceImpl;
import net.javaguides.springboot.util.EmployeeCodeGenerator;

/**
 * Tests the actual business rules this project depends on: duplicate-email
 * rejection on create/update, and not-found handling. These are the two
 * places a bug here would silently corrupt data or return the wrong HTTP
 * status - not tests written just to inflate coverage numbers.
 */
@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeCodeGenerator employeeCodeGenerator;

    private EmployeeMapper employeeMapper;

    private EmployeeServiceImpl employeeService;

    private EmployeeRequestDto requestDto;

    @BeforeEach
    void setUp() {
        employeeMapper = new EmployeeMapper();
        employeeService = new EmployeeServiceImpl(employeeRepository, employeeMapper, employeeCodeGenerator);

        requestDto = new EmployeeRequestDto();
        requestDto.setFirstName("Ada");
        requestDto.setLastName("Lovelace");
        requestDto.setEmail("ada@example.com");
        requestDto.setPhone("+919876543210");
        requestDto.setDateOfBirth(LocalDate.of(1990, 1, 1));
        requestDto.setDateOfJoining(LocalDate.of(2020, 1, 1));
        requestDto.setDepartment(Department.IT);
        requestDto.setDesignation("Software Engineer");
        requestDto.setSalary(BigDecimal.valueOf(75000));
        requestDto.setEmploymentType(EmploymentType.FULL_TIME);
        requestDto.setStatus(EmployeeStatus.ACTIVE);
    }

    @Test
    void createEmployee_savesAndReturnsGeneratedCode() {
        when(employeeRepository.existsByEmail("ada@example.com")).thenReturn(false);
        when(employeeCodeGenerator.generate()).thenReturn("EMP-2026-TEST0001");
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee e = invocation.getArgument(0);
            e.setId(1L);
            return e;
        });

        EmployeeResponseDto result = employeeService.createEmployee(requestDto);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmployeeCode()).isEqualTo("EMP-2026-TEST0001");
        assertThat(result.getEmail()).isEqualTo("ada@example.com");
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void createEmployee_rejectsDuplicateEmail() {
        when(employeeRepository.existsByEmail("ada@example.com")).thenReturn(true);

        assertThatThrownBy(() -> employeeService.createEmployee(requestDto))
                .isInstanceOf(DuplicateEmployeeException.class)
                .hasMessageContaining("ada@example.com");
    }

    @Test
    void getEmployeeById_throwsWhenNotFound() {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.getEmployeeById(99L))
                .isInstanceOf(EmployeeNotFoundException.class);
    }

    @Test
    void updateEmployee_rejectsEmailBelongingToAnotherEmployee() {
        Employee existingTarget = new Employee();
        existingTarget.setId(1L);
        existingTarget.setEmail("old@example.com");

        Employee conflictingOwner = new Employee();
        conflictingOwner.setId(2L);
        conflictingOwner.setEmail("ada@example.com");

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(existingTarget));
        when(employeeRepository.findByEmail("ada@example.com")).thenReturn(Optional.of(conflictingOwner));

        assertThatThrownBy(() -> employeeService.updateEmployee(1L, requestDto))
                .isInstanceOf(DuplicateEmployeeException.class);
    }

    @Test
    void updateEmployee_allowsKeepingOwnEmail() {
        Employee existing = new Employee();
        existing.setId(1L);
        existing.setEmail("ada@example.com");

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(employeeRepository.findByEmail("ada@example.com")).thenReturn(Optional.of(existing));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EmployeeResponseDto result = employeeService.updateEmployee(1L, requestDto);

        assertThat(result.getEmail()).isEqualTo("ada@example.com");
    }

    @Test
    void deleteEmployee_throwsWhenNotFound() {
        when(employeeRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.deleteEmployee(5L))
                .isInstanceOf(EmployeeNotFoundException.class);
    }
}
