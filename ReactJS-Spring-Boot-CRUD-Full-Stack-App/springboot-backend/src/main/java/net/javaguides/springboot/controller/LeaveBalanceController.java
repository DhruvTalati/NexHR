package net.javaguides.springboot.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.javaguides.springboot.dto.LeaveBalanceResponseDto;
import net.javaguides.springboot.entity.enums.LeaveType;
import net.javaguides.springboot.service.LeaveBalanceService;

@RestController
@RequestMapping("/api/v1/leave-balances")
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;

    public LeaveBalanceController(
            LeaveBalanceService leaveBalanceService) {

        this.leaveBalanceService = leaveBalanceService;
    }

    /**
     * Logged-in employee's leave balances.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<LeaveBalanceResponseDto>> getMyBalances(
            Authentication authentication) {

        return ResponseEntity.ok(
                leaveBalanceService.getMyBalances(
                        authentication.getName()
                )
        );
    }

    /**
     * Get a specific leave balance for the logged-in employee.
     */
    @GetMapping("/my/{leaveType}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveBalanceResponseDto> getMyBalance(
            @PathVariable LeaveType leaveType,
            Authentication authentication) {

        return ResponseEntity.ok(
                leaveBalanceService.getBalance(
                        authentication.getName(),
                        leaveType
                )
        );
    }

    /**
     * HR/Admin can view an employee's balances.
     */
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<LeaveBalanceResponseDto>> getEmployeeBalances(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                leaveBalanceService.getEmployeeBalances(
                        employeeId
                )
        );
    }
}