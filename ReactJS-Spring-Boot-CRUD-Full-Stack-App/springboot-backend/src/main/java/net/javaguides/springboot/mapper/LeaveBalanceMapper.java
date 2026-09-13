package net.javaguides.springboot.mapper;

import org.springframework.stereotype.Component;

import net.javaguides.springboot.dto.LeaveBalanceResponseDto;
import net.javaguides.springboot.entity.Employee;
import net.javaguides.springboot.entity.LeaveBalance;

@Component
public class LeaveBalanceMapper {

    public LeaveBalanceResponseDto toResponseDto(
            LeaveBalance balance) {

        LeaveBalanceResponseDto dto =
                new LeaveBalanceResponseDto();

        dto.setId(balance.getId());
        dto.setLeaveType(balance.getLeaveType());
        dto.setAllocatedDays(balance.getAllocatedDays());
        dto.setUsedDays(balance.getUsedDays());
        dto.setRemainingDays(balance.getRemainingDays());

        Employee employee = balance.getEmployee();

        if (employee != null) {
            dto.setEmployeeId(employee.getId());
            dto.setEmployeeCode(employee.getEmployeeCode());
        }

        return dto;
    }
}