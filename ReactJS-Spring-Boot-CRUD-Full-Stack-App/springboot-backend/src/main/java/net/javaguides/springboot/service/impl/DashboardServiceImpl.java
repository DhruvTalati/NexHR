package net.javaguides.springboot.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.springboot.dto.DashboardStatsDto;
import net.javaguides.springboot.dto.DepartmentSummaryDto;
import net.javaguides.springboot.entity.enums.EmployeeStatus;
import net.javaguides.springboot.repository.EmployeeRepository;
import net.javaguides.springboot.service.DashboardService;

/**
 * Every figure here is computed from live repository queries - nothing is
 * hardcoded. See EmployeeRepository for the aggregate queries backing this.
 */
@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final EmployeeRepository employeeRepository;

    public DashboardServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public DashboardStatsDto getStats() {
        long total = employeeRepository.count();
        long active = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long inactive = employeeRepository.countByStatus(EmployeeStatus.INACTIVE);
        long onLeave = employeeRepository.countByStatus(EmployeeStatus.ON_LEAVE);
        long departmentCount = employeeRepository.countDistinctDepartments();

        Double rawAverage = employeeRepository.findAverageSalary();
        BigDecimal averageSalary = rawAverage == null
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(rawAverage).setScale(2, RoundingMode.HALF_UP);

        return new DashboardStatsDto(total, active, inactive, onLeave, departmentCount, averageSalary);
    }

    @Override
    public List<DepartmentSummaryDto> getDepartmentSummary() {
        return employeeRepository.countEmployeesGroupedByDepartment().stream()
                .map(row -> new DepartmentSummaryDto(row.getDepartment(), row.getEmployeeCount()))
                .toList();
    }
}
