package net.javaguides.springboot.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.springboot.dto.EmployeeRequestDto;
import net.javaguides.springboot.dto.EmployeeResponseDto;
import net.javaguides.springboot.dto.PageResponseDto;
import net.javaguides.springboot.entity.Employee;
import net.javaguides.springboot.entity.enums.Department;
import net.javaguides.springboot.entity.enums.EmployeeStatus;
import net.javaguides.springboot.exception.DuplicateEmployeeException;
import net.javaguides.springboot.exception.EmployeeNotFoundException;
import net.javaguides.springboot.mapper.EmployeeMapper;
import net.javaguides.springboot.repository.EmployeeRepository;
import net.javaguides.springboot.service.EmployeeService;
import net.javaguides.springboot.specification.EmployeeSpecification;
import net.javaguides.springboot.util.EmployeeCodeGenerator;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeServiceImpl.class);
    private static final int MAX_PAGE_SIZE = 100;

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;
    private final EmployeeCodeGenerator employeeCodeGenerator;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                                EmployeeMapper employeeMapper,
                                EmployeeCodeGenerator employeeCodeGenerator) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
        this.employeeCodeGenerator = employeeCodeGenerator;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<EmployeeResponseDto> getAllEmployees(int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDirection);
        Page<Employee> result = employeeRepository.findAll(pageable);
        return toPageResponse(result);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<EmployeeResponseDto> searchEmployees(String keyword, int page, int size) {
        Pageable pageable = buildPageable(page, size, "firstName", "ASC");
        Specification<Employee> spec = EmployeeSpecification.keywordMatches(keyword);
        Page<Employee> result = employeeRepository.findAll(spec, pageable);
        return toPageResponse(result);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<EmployeeResponseDto> filterEmployees(String name, String email, Department department,
                                                                 String designation, EmployeeStatus status,
                                                                 int page, int size) {
        Pageable pageable = buildPageable(page, size, "firstName", "ASC");
        Specification<Employee> spec = Specification
                .where(EmployeeSpecification.nameContains(name))
                .and(EmployeeSpecification.emailContains(email))
                .and(EmployeeSpecification.hasDepartment(department))
                .and(EmployeeSpecification.hasDesignation(designation))
                .and(EmployeeSpecification.hasStatus(status));
        Page<Employee> result = employeeRepository.findAll(spec, pageable);
        return toPageResponse(result);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponseDto getEmployeeById(Long id) {
        return employeeMapper.toResponseDto(findEmployeeOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponseDto getEmployeeByEmail(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("No employee profile linked to email: " + email));
        return employeeMapper.toResponseDto(employee);
    }

    @Override
    public EmployeeResponseDto createEmployee(EmployeeRequestDto employeeRequestDto) {
        if (employeeRepository.existsByEmail(employeeRequestDto.getEmail())) {
            throw new DuplicateEmployeeException(
                    "An employee with email '" + employeeRequestDto.getEmail() + "' already exists");
        }

        Employee employee = employeeMapper.toEntity(employeeRequestDto);
        employee.setEmployeeCode(employeeCodeGenerator.generate());
        Employee saved = employeeRepository.save(employee);
        log.info("Created employee id={} code={}", saved.getId(), saved.getEmployeeCode());
        return employeeMapper.toResponseDto(saved);
    }

    @Override
    public EmployeeResponseDto updateEmployee(Long id, EmployeeRequestDto employeeRequestDto) {
        Employee employee = findEmployeeOrThrow(id);

        employeeRepository.findByEmail(employeeRequestDto.getEmail())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateEmployeeException(
                            "An employee with email '" + employeeRequestDto.getEmail() + "' already exists");
                });

        employeeMapper.updateEntityFromDto(employeeRequestDto, employee);
        Employee updated = employeeRepository.save(employee);
        log.info("Updated employee id={}", updated.getId());
        return employeeMapper.toResponseDto(updated);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee employee = findEmployeeOrThrow(id);
        employeeRepository.delete(employee);
        log.info("Deleted employee id={}", id);
    }

    private Employee findEmployeeOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id : " + id));
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDirection) {
        int safePage = Math.max(page, 0);
        int safeSize = (size <= 0) ? 10 : Math.min(size, MAX_PAGE_SIZE);
        String safeSortBy = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        Sort.Direction direction = "DESC".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(safePage, safeSize, Sort.by(direction, safeSortBy));
    }

    private PageResponseDto<EmployeeResponseDto> toPageResponse(Page<Employee> result) {
        Page<EmployeeResponseDto> mapped = result.map(employeeMapper::toResponseDto);
        return PageResponseDto.from(mapped);
    }
}
