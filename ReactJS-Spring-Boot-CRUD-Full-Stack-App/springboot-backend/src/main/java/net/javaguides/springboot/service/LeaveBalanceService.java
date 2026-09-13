package net.javaguides.springboot.service;

import java.util.List;

import net.javaguides.springboot.dto.LeaveBalanceResponseDto;
import net.javaguides.springboot.entity.enums.LeaveType;

public interface LeaveBalanceService {

    List<LeaveBalanceResponseDto> getMyBalances(
            String email
    );

    List<LeaveBalanceResponseDto> getEmployeeBalances(
            Long employeeId
    );

    LeaveBalanceResponseDto getBalance(
            String email,
            LeaveType leaveType
    );

    void initializeBalances(Long employeeId);

    void validateBalance(
            Long employeeId,
            LeaveType leaveType,
            int requestedDays
    );

    void deductBalance(
            Long employeeId,
            LeaveType leaveType,
            int days
    );

    void restoreBalance(
            Long employeeId,
            LeaveType leaveType,
            int days
    );
}