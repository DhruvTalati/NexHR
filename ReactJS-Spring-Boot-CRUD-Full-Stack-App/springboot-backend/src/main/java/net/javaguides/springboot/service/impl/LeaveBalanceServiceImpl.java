package net.javaguides.springboot.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.springboot.dto.LeaveBalanceResponseDto;
import net.javaguides.springboot.entity.Employee;
import net.javaguides.springboot.entity.LeaveBalance;
import net.javaguides.springboot.entity.enums.LeaveType;
import net.javaguides.springboot.exception.EmployeeNotFoundException;
import net.javaguides.springboot.mapper.LeaveBalanceMapper;
import net.javaguides.springboot.repository.EmployeeRepository;
import net.javaguides.springboot.repository.LeaveBalanceRepository;
import net.javaguides.springboot.service.LeaveBalanceService;

@Service
@Transactional
public class LeaveBalanceServiceImpl
        implements LeaveBalanceService {

    private static final int DEFAULT_CASUAL_DAYS = 12;
    private static final int DEFAULT_SICK_DAYS = 8;
    private static final int DEFAULT_ANNUAL_DAYS = 15;

    private final LeaveBalanceRepository balanceRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceMapper balanceMapper;

    public LeaveBalanceServiceImpl(
            LeaveBalanceRepository balanceRepository,
            EmployeeRepository employeeRepository,
            LeaveBalanceMapper balanceMapper) {

        this.balanceRepository = balanceRepository;
        this.employeeRepository = employeeRepository;
        this.balanceMapper = balanceMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceResponseDto> getMyBalances(
            String email) {

        Employee employee = findEmployeeByEmail(email);

        initializeBalancesIfMissing(employee);

        return balanceRepository
                .findByEmployeeIdOrderByLeaveTypeAsc(
                        employee.getId()
                )
                .stream()
                .map(balanceMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceResponseDto> getEmployeeBalances(
            Long employeeId) {

        Employee employee =
                findEmployeeOrThrow(employeeId);

        initializeBalancesIfMissing(employee);

        return balanceRepository
                .findByEmployeeIdOrderByLeaveTypeAsc(
                        employeeId
                )
                .stream()
                .map(balanceMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveBalanceResponseDto getBalance(
            String email,
            LeaveType leaveType) {

        if (leaveType == null) {
            throw new IllegalArgumentException(
                    "Leave type is required"
            );
        }

        Employee employee =
                findEmployeeByEmail(email);

        initializeBalancesIfMissing(employee);

        LeaveBalance balance =
                balanceRepository
                        .findByEmployeeIdAndLeaveType(
                                employee.getId(),
                                leaveType
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Leave balance not found"
                                )
                        );

        return balanceMapper.toResponseDto(balance);
    }

    @Override
    public void initializeBalances(Long employeeId) {

        Employee employee =
                findEmployeeOrThrow(employeeId);

        initializeBalancesIfMissing(employee);
    }

    @Override
    public void validateBalance(
            Long employeeId,
            LeaveType leaveType,
            int requestedDays) {

        if (requestedDays <= 0) {
            throw new IllegalArgumentException(
                    "Requested leave days must be greater than zero"
            );
        }

        /*
         * UNPAID leave does not consume a paid leave balance.
         */
        if (leaveType == LeaveType.UNPAID) {
            return;
        }

        Employee employee =
                findEmployeeOrThrow(employeeId);

        initializeBalancesIfMissing(employee);

        LeaveBalance balance =
                balanceRepository
                        .findByEmployeeIdAndLeaveType(
                                employeeId,
                                leaveType
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Leave balance not found"
                                )
                        );

        if (balance.getRemainingDays() < requestedDays) {
            throw new IllegalStateException(
                    "Insufficient " +
                    leaveType.name().toLowerCase() +
                    " leave balance. Available: " +
                    balance.getRemainingDays() +
                    " days"
            );
        }
    }

    @Override
    public void deductBalance(
            Long employeeId,
            LeaveType leaveType,
            int days) {

        if (leaveType == LeaveType.UNPAID) {
            return;
        }

        if (days <= 0) {
            throw new IllegalArgumentException(
                    "Days must be greater than zero"
            );
        }

        Employee employee =
                findEmployeeOrThrow(employeeId);

        initializeBalancesIfMissing(employee);

        LeaveBalance balance =
                balanceRepository
                        .findByEmployeeIdAndLeaveType(
                                employeeId,
                                leaveType
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Leave balance not found"
                                )
                        );

        if (balance.getRemainingDays() < days) {
            throw new IllegalStateException(
                    "Insufficient leave balance"
            );
        }

        balance.setUsedDays(
                balance.getUsedDays() + days
        );

        /*
         * remainingDays is recalculated in @PreUpdate.
         */
        balanceRepository.save(balance);
    }

    @Override
    public void restoreBalance(
            Long employeeId,
            LeaveType leaveType,
            int days) {

        if (leaveType == LeaveType.UNPAID) {
            return;
        }

        if (days <= 0) {
            return;
        }

        LeaveBalance balance =
                balanceRepository
                        .findByEmployeeIdAndLeaveType(
                                employeeId,
                                leaveType
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Leave balance not found"
                                )
                        );

        int restoredUsedDays =
                Math.max(
                        balance.getUsedDays() - days,
                        0
                );

        balance.setUsedDays(
                restoredUsedDays
        );

        balanceRepository.save(balance);
    }

    private void initializeBalancesIfMissing(
            Employee employee) {

        createIfMissing(
                employee,
                LeaveType.CASUAL,
                DEFAULT_CASUAL_DAYS
        );

        createIfMissing(
                employee,
                LeaveType.SICK,
                DEFAULT_SICK_DAYS
        );

        createIfMissing(
                employee,
                LeaveType.ANNUAL,
                DEFAULT_ANNUAL_DAYS
        );
    }

    private void createIfMissing(
            Employee employee,
            LeaveType leaveType,
            int allocatedDays) {

        boolean exists =
                balanceRepository
                        .findByEmployeeIdAndLeaveType(
                                employee.getId(),
                                leaveType
                        )
                        .isPresent();

        if (exists) {
            return;
        }

        LeaveBalance balance =
                new LeaveBalance();

        balance.setEmployee(employee);
        balance.setLeaveType(leaveType);
        balance.setAllocatedDays(allocatedDays);
        balance.setUsedDays(0);
        balance.setRemainingDays(allocatedDays);

        balanceRepository.save(balance);
    }

    private Employee findEmployeeByEmail(
            String email) {

        return employeeRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "No employee profile linked to email: "
                                        + email
                        )
                );
    }

    private Employee findEmployeeOrThrow(
            Long employeeId) {

        return employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : "
                                        + employeeId
                        )
                );
    }
}