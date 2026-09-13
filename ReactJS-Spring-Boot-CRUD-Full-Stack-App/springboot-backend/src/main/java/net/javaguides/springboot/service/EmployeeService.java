package net.javaguides.springboot.service;

import net.javaguides.springboot.dto.EmployeeRequestDto;
import net.javaguides.springboot.dto.EmployeeResponseDto;
import net.javaguides.springboot.dto.PageResponseDto;
import net.javaguides.springboot.entity.enums.Department;
import net.javaguides.springboot.entity.enums.EmployeeStatus;

/**
 * Business operations for Employee. Controllers depend on this interface,
 * not on the repository directly, so HTTP concerns stay separate from
 * business logic and transaction boundaries.
 */
public interface EmployeeService {

    PageResponseDto<EmployeeResponseDto> getAllEmployees(int page, int size, String sortBy, String sortDirection);

    PageResponseDto<EmployeeResponseDto> searchEmployees(String keyword, int page, int size);

    PageResponseDto<EmployeeResponseDto> filterEmployees(String name, String email, Department department,
                                                           String designation, EmployeeStatus status,
                                                           int page, int size);

    EmployeeResponseDto getEmployeeById(Long id);

    EmployeeResponseDto getEmployeeByEmail(String email);

    EmployeeResponseDto createEmployee(EmployeeRequestDto employeeRequestDto);

    EmployeeResponseDto updateEmployee(Long id, EmployeeRequestDto employeeRequestDto);

    void deleteEmployee(Long id);
}
