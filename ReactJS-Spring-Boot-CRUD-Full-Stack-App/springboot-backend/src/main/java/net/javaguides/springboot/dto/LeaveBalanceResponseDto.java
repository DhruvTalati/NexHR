package net.javaguides.springboot.dto;

import net.javaguides.springboot.entity.enums.LeaveType;

public class LeaveBalanceResponseDto {

    private Long id;

    private Long employeeId;

    private String employeeCode;

    private LeaveType leaveType;

    private Integer allocatedDays;

    private Integer usedDays;

    private Integer remainingDays;

    public LeaveBalanceResponseDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public LeaveType getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(LeaveType leaveType) {
        this.leaveType = leaveType;
    }

    public Integer getAllocatedDays() {
        return allocatedDays;
    }

    public void setAllocatedDays(Integer allocatedDays) {
        this.allocatedDays = allocatedDays;
    }

    public Integer getUsedDays() {
        return usedDays;
    }

    public void setUsedDays(Integer usedDays) {
        this.usedDays = usedDays;
    }

    public Integer getRemainingDays() {
        return remainingDays;
    }

    public void setRemainingDays(Integer remainingDays) {
        this.remainingDays = remainingDays;
    }
}