package net.javaguides.springboot.dto;

import net.javaguides.springboot.entity.enums.Department;

public class DepartmentSummaryDto {

    private final Department department;
    private final long employeeCount;

    public DepartmentSummaryDto(Department department, long employeeCount) {
        this.department = department;
        this.employeeCount = employeeCount;
    }

    public Department getDepartment() {
        return department;
    }

    public long getEmployeeCount() {
        return employeeCount;
    }
}
