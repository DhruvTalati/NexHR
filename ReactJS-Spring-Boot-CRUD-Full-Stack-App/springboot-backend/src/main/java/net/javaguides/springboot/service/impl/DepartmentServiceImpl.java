package net.javaguides.springboot.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.springboot.dto.DepartmentRequestDto;
import net.javaguides.springboot.dto.DepartmentResponseDto;
import net.javaguides.springboot.entity.Department;
import net.javaguides.springboot.exception.BadRequestException;
import net.javaguides.springboot.exception.EmployeeNotFoundException;
import net.javaguides.springboot.repository.DepartmentRepository;
import net.javaguides.springboot.repository.EmployeeRepository;
import net.javaguides.springboot.service.DepartmentService;

@Service
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository, EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponseDto> getAllDepartments() {
        return departmentRepository.findAll().stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponseDto getDepartmentById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Override
    public DepartmentResponseDto createDepartment(DepartmentRequestDto requestDto) {
        if (departmentRepository.existsByNameIgnoreCase(requestDto.getName())) {
            throw new BadRequestException("A department named '" + requestDto.getName() + "' already exists");
        }
        Department department = new Department();
        department.setName(requestDto.getName());
        department.setDescription(requestDto.getDescription());
        return toDto(departmentRepository.save(department));
    }

    @Override
    public DepartmentResponseDto updateDepartment(Long id, DepartmentRequestDto requestDto) {
        Department department = findOrThrow(id);
        department.setName(requestDto.getName());
        department.setDescription(requestDto.getDescription());
        return toDto(departmentRepository.save(department));
    }

    /**
     * Prevents deleting a department that still has employees assigned to
     * it, per the spec. Since Department (this entity) and the
     * Employee.department enum are only loosely linked by name (see the
     * class-level note on Department), this check maps the department's
     * name to the corresponding enum constant, if one exists, and blocks
     * deletion when employees reference it. A department whose name
     * doesn't match any enum constant is always safe to delete, since no
     * employee could possibly reference it.
     */
    @Override
    public void deleteDepartment(Long id) {
        Department department = findOrThrow(id);

        try {
            net.javaguides.springboot.entity.enums.Department matchingEnum =
                    net.javaguides.springboot.entity.enums.Department.valueOf(department.getName().toUpperCase());
            long employeeCount = employeeRepository.countByDepartment(matchingEnum);
            if (employeeCount > 0) {
                throw new BadRequestException(
                        "Cannot delete department '" + department.getName() + "': "
                                + employeeCount + " employee(s) are still assigned to it");
            }
        } catch (IllegalArgumentException ex) {
            // Name doesn't match any Department enum constant - no employee
            // could reference it, so deletion is unconditionally safe.
        }

        departmentRepository.delete(department);
    }

    private Department findOrThrow(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Department not found with id : " + id));
    }

    private DepartmentResponseDto toDto(Department department) {
        return new DepartmentResponseDto(department.getId(), department.getName(), department.getDescription(),
                department.getCreatedAt(), department.getUpdatedAt());
    }
}
