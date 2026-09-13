package net.javaguides.springboot.mapper;

import org.springframework.stereotype.Component;

import net.javaguides.springboot.dto.EmployeeRequestDto;
import net.javaguides.springboot.dto.EmployeeResponseDto;
import net.javaguides.springboot.entity.Employee;

/**
 * Converts between the Employee entity (persistence model) and the
 * request/response DTOs (API models). Keeping this conversion in one place
 * means the entity's internal shape can change without every layer needing
 * to know about it, and server-managed fields never round-trip from the
 * request DTO back into the entity.
 */
@Component
public class EmployeeMapper {

    public EmployeeResponseDto toResponseDto(Employee employee) {
        if (employee == null) {
            return null;
        }
        EmployeeResponseDto dto = new EmployeeResponseDto();
        dto.setId(employee.getId());
        dto.setEmployeeCode(employee.getEmployeeCode());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setDateOfBirth(employee.getDateOfBirth());
        dto.setDateOfJoining(employee.getDateOfJoining());
        dto.setDepartment(employee.getDepartment());
        dto.setDesignation(employee.getDesignation());
        dto.setSalary(employee.getSalary());
        dto.setEmploymentType(employee.getEmploymentType());
        dto.setStatus(employee.getStatus());
        dto.setAddress(employee.getAddress());
        dto.setCity(employee.getCity());
        dto.setCountry(employee.getCountry());
        dto.setCreatedAt(employee.getCreatedAt());
        dto.setUpdatedAt(employee.getUpdatedAt());
        return dto;
    }

    public Employee toEntity(EmployeeRequestDto dto) {
        if (dto == null) {
            return null;
        }
        Employee employee = new Employee();
        applyRequestFields(dto, employee);
        return employee;
    }

    /**
     * Applies client-settable fields from a request DTO onto an existing
     * managed entity. Never touches id, employeeCode, createdAt, updatedAt -
     * those are server-managed.
     */
    public void updateEntityFromDto(EmployeeRequestDto dto, Employee employee) {
        applyRequestFields(dto, employee);
    }

    private void applyRequestFields(EmployeeRequestDto dto, Employee employee) {
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setDateOfBirth(dto.getDateOfBirth());
        employee.setDateOfJoining(dto.getDateOfJoining());
        employee.setDepartment(dto.getDepartment());
        employee.setDesignation(dto.getDesignation());
        employee.setSalary(dto.getSalary());
        employee.setEmploymentType(dto.getEmploymentType());
        employee.setStatus(dto.getStatus());
        employee.setAddress(dto.getAddress());
        employee.setCity(dto.getCity());
        employee.setCountry(dto.getCountry());
    }
}
