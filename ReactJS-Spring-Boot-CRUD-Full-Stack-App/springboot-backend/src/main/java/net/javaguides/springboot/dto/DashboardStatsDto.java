package net.javaguides.springboot.dto;

import java.math.BigDecimal;

public class DashboardStatsDto {

    private final long totalEmployees;
    private final long activeEmployees;
    private final long inactiveEmployees;
    private final long employeesOnLeave;
    private final long departmentCount;
    private final BigDecimal averageSalary;

    public DashboardStatsDto(long totalEmployees, long activeEmployees, long inactiveEmployees,
                              long employeesOnLeave, long departmentCount, BigDecimal averageSalary) {
        this.totalEmployees = totalEmployees;
        this.activeEmployees = activeEmployees;
        this.inactiveEmployees = inactiveEmployees;
        this.employeesOnLeave = employeesOnLeave;
        this.departmentCount = departmentCount;
        this.averageSalary = averageSalary;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public long getActiveEmployees() {
        return activeEmployees;
    }

    public long getInactiveEmployees() {
        return inactiveEmployees;
    }

    public long getEmployeesOnLeave() {
        return employeesOnLeave;
    }

    public long getDepartmentCount() {
        return departmentCount;
    }

    public BigDecimal getAverageSalary() {
        return averageSalary;
    }
}
