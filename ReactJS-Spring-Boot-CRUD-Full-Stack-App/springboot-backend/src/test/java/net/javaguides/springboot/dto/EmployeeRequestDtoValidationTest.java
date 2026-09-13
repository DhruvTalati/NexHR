package net.javaguides.springboot.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import org.junit.jupiter.api.Test;

import net.javaguides.springboot.entity.enums.Department;
import net.javaguides.springboot.entity.enums.EmployeeStatus;
import net.javaguides.springboot.entity.enums.EmploymentType;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class EmployeeRequestDtoValidationTest {

    private static final Validator VALIDATOR;

    static {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            VALIDATOR = factory.getValidator();
        }
    }

    @Test
    void fullyPopulatedValidDto_hasNoViolations() {
        EmployeeRequestDto dto = fullyValidDto();

        Set<ConstraintViolation<EmployeeRequestDto>> violations = VALIDATOR.validate(dto);

        assertThat(violations).isEmpty();
    }

    @Test
    void blankFirstName_isRejected() {
        EmployeeRequestDto dto = fullyValidDto();
        dto.setFirstName("  ");

        Set<ConstraintViolation<EmployeeRequestDto>> violations = VALIDATOR.validate(dto);

        assertThat(violations).extracting(v -> v.getPropertyPath().toString())
                .contains("firstName");
    }

    @Test
    void malformedEmail_isRejected() {
        EmployeeRequestDto dto = fullyValidDto();
        dto.setEmail("not-an-email");

        Set<ConstraintViolation<EmployeeRequestDto>> violations = VALIDATOR.validate(dto);

        assertThat(violations).extracting(v -> v.getPropertyPath().toString())
                .contains("email");
    }

    @Test
    void futureDateOfBirth_isRejected() {
        EmployeeRequestDto dto = fullyValidDto();
        dto.setDateOfBirth(LocalDate.now().plusDays(1));

        Set<ConstraintViolation<EmployeeRequestDto>> violations = VALIDATOR.validate(dto);

        assertThat(violations).extracting(v -> v.getPropertyPath().toString())
                .contains("dateOfBirth");
    }

    @Test
    void negativeSalary_isRejected() {
        EmployeeRequestDto dto = fullyValidDto();
        dto.setSalary(BigDecimal.valueOf(-100));

        Set<ConstraintViolation<EmployeeRequestDto>> violations = VALIDATOR.validate(dto);

        assertThat(violations).extracting(v -> v.getPropertyPath().toString())
                .contains("salary");
    }

    @Test
    void malformedPhone_isRejected() {
        EmployeeRequestDto dto = fullyValidDto();
        dto.setPhone("abc-not-a-phone");

        Set<ConstraintViolation<EmployeeRequestDto>> violations = VALIDATOR.validate(dto);

        assertThat(violations).extracting(v -> v.getPropertyPath().toString())
                .contains("phone");
    }

    private EmployeeRequestDto fullyValidDto() {
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
