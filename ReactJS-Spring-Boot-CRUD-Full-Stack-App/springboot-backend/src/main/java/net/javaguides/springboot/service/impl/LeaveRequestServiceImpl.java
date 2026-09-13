package net.javaguides.springboot.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.springboot.dto.LeaveRequestDto;
import net.javaguides.springboot.dto.LeaveResponseDto;
import net.javaguides.springboot.entity.Employee;
import net.javaguides.springboot.entity.LeaveRequest;
import net.javaguides.springboot.entity.enums.LeaveStatus;
import net.javaguides.springboot.entity.enums.LeaveType;
import net.javaguides.springboot.exception.EmployeeNotFoundException;
import net.javaguides.springboot.mapper.LeaveRequestMapper;
import net.javaguides.springboot.repository.EmployeeRepository;
import net.javaguides.springboot.repository.LeaveRequestRepository;
import net.javaguides.springboot.service.LeaveBalanceService;
import net.javaguides.springboot.service.LeaveRequestService;

@Service
@Transactional
public class LeaveRequestServiceImpl
        implements LeaveRequestService {

    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveRequestMapper leaveMapper;
    private final LeaveBalanceService leaveBalanceService;

    public LeaveRequestServiceImpl(
            LeaveRequestRepository leaveRepository,
            EmployeeRepository employeeRepository,
            LeaveRequestMapper leaveMapper,
            LeaveBalanceService leaveBalanceService) {

        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.leaveMapper = leaveMapper;
        this.leaveBalanceService = leaveBalanceService;
    }

    @Override
    public LeaveResponseDto applyLeave(
            String email,
            LeaveRequestDto request) {

        validateLeaveRequest(request);

        Employee employee =
                findEmployeeByEmail(email);

        LocalDate startDate =
                request.getStartDate();

        LocalDate endDate =
                request.getEndDate();

        int totalDays =
                calculateTotalDays(
                        startDate,
                        endDate
                );

        /*
         * Prevent overlapping pending or approved
         * requests for the same employee.
         */
        List<LeaveRequest> overlapping =
                leaveRepository
                        .findByEmployeeIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                employee.getId(),
                                List.of(
                                        LeaveStatus.PENDING,
                                        LeaveStatus.APPROVED
                                ),
                                endDate,
                                startDate
                        );

        if (!overlapping.isEmpty()) {
            throw new IllegalStateException(
                    "The requested dates overlap with an existing "
                            + "pending or approved leave request"
            );
        }

        /*
         * Validate available balance before creating
         * the request.
         *
         * UNPAID leave does not consume paid leave balance.
         */
        leaveBalanceService.validateBalance(
                employee.getId(),
                request.getLeaveType(),
                totalDays
        );

        LeaveRequest leaveRequest =
                new LeaveRequest();

        leaveRequest.setEmployee(employee);

        leaveRequest.setLeaveType(
                request.getLeaveType()
        );

        leaveRequest.setStartDate(startDate);
        leaveRequest.setEndDate(endDate);
        leaveRequest.setTotalDays(totalDays);

        if (request.getReason() != null) {
            leaveRequest.setReason(
                    request.getReason().trim()
            );
        }

        leaveRequest.setStatus(
                LeaveStatus.PENDING
        );

        LeaveRequest saved =
                leaveRepository.save(leaveRequest);

        return leaveMapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponseDto> getMyLeaves(
            String email) {

        Employee employee =
                findEmployeeByEmail(email);

        return leaveRepository
                .findByEmployeeIdOrderByCreatedAtDesc(
                        employee.getId()
                )
                .stream()
                .map(leaveMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveResponseDto getMyLeave(
            String email,
            Long leaveId) {

        Employee employee =
                findEmployeeByEmail(email);

        LeaveRequest leaveRequest =
                leaveRepository
                        .findByIdAndEmployeeId(
                                leaveId,
                                employee.getId()
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Leave request not found"
                                )
                        );

        return leaveMapper.toResponseDto(
                leaveRequest
        );
    }

    @Override
    public void cancelLeave(
            String email,
            Long leaveId) {

        Employee employee =
                findEmployeeByEmail(email);

        LeaveRequest leaveRequest =
                leaveRepository
                        .findByIdAndEmployeeId(
                                leaveId,
                                employee.getId()
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Leave request not found"
                                )
                        );

        /*
         * Pending requests have not consumed balance yet,
         * so cancelling them does not require restoration.
         */
        if (leaveRequest.getStatus()
                != LeaveStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending leave requests can be cancelled"
            );
        }

        leaveRepository.delete(leaveRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponseDto> getAllLeaves() {

        return leaveRepository
                .findAll()
                .stream()
                .sorted(
                        (first, second) ->
                                second.getCreatedAt()
                                        .compareTo(
                                                first.getCreatedAt()
                                        )
                )
                .map(leaveMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponseDto> getPendingLeaves() {

        return leaveRepository
                .findByStatusOrderByCreatedAtDesc(
                        LeaveStatus.PENDING
                )
                .stream()
                .map(leaveMapper::toResponseDto)
                .toList();
    }

    @Override
    public LeaveResponseDto approveLeave(
            Long leaveId,
            String reviewedBy) {

        LeaveRequest leaveRequest =
                findLeaveOrThrow(leaveId);

        if (leaveRequest.getStatus()
                != LeaveStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending leave requests can be approved"
            );
        }

        /*
         * Re-check balance at approval time.
         *
         * This protects against another approved request
         * consuming the available balance while this request
         * was waiting for review.
         */
        leaveBalanceService.validateBalance(
                leaveRequest.getEmployee().getId(),
                leaveRequest.getLeaveType(),
                leaveRequest.getTotalDays()
        );

        /*
         * Deduct only when HR/Admin actually approves
         * the leave.
         */
        leaveBalanceService.deductBalance(
                leaveRequest.getEmployee().getId(),
                leaveRequest.getLeaveType(),
                leaveRequest.getTotalDays()
        );

        leaveRequest.setStatus(
                LeaveStatus.APPROVED
        );

        leaveRequest.setReviewedBy(
                reviewedBy
        );

        leaveRequest.setReviewedAt(
                LocalDateTime.now()
        );

        leaveRequest.setRejectionReason(null);

        LeaveRequest saved =
                leaveRepository.save(leaveRequest);

        return leaveMapper.toResponseDto(saved);
    }

    @Override
    public LeaveResponseDto rejectLeave(
            Long leaveId,
            String rejectionReason,
            String reviewedBy) {

        if (rejectionReason == null ||
                rejectionReason.isBlank()) {

            throw new IllegalArgumentException(
                    "Rejection reason is required"
            );
        }

        LeaveRequest leaveRequest =
                findLeaveOrThrow(leaveId);

        if (leaveRequest.getStatus()
                != LeaveStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending leave requests can be rejected"
            );
        }

        /*
         * Balance is NOT deducted for rejected leave.
         */
        leaveRequest.setStatus(
                LeaveStatus.REJECTED
        );

        leaveRequest.setReviewedBy(
                reviewedBy
        );

        leaveRequest.setReviewedAt(
                LocalDateTime.now()
        );

        leaveRequest.setRejectionReason(
                rejectionReason.trim()
        );

        LeaveRequest saved =
                leaveRepository.save(leaveRequest);

        return leaveMapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public long countPending() {

        return leaveRepository.countByStatus(
                LeaveStatus.PENDING
        );
    }

    @Override
    @Transactional(readOnly = true)
    public long countApproved() {

        return leaveRepository.countByStatus(
                LeaveStatus.APPROVED
        );
    }

    @Override
    @Transactional(readOnly = true)
    public long countRejected() {

        return leaveRepository.countByStatus(
                LeaveStatus.REJECTED
        );
    }

    private void validateLeaveRequest(
            LeaveRequestDto request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Leave request is required"
            );
        }

        if (request.getLeaveType() == null) {
            throw new IllegalArgumentException(
                    "Leave type is required"
            );
        }

        if (request.getStartDate() == null ||
                request.getEndDate() == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (request.getStartDate()
                .isAfter(request.getEndDate())) {

            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }

        /*
         * A leave request starting in the past is not allowed.
         */
        if (request.getStartDate()
                .isBefore(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Leave start date cannot be in the past"
            );
        }
    }

    private int calculateTotalDays(
            LocalDate startDate,
            LocalDate endDate) {

        return (int) ChronoUnit.DAYS.between(
                startDate,
                endDate
        ) + 1;
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

    private LeaveRequest findLeaveOrThrow(
            Long leaveId) {

        return leaveRepository
                .findById(leaveId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Leave request not found"
                        )
                );
    }
}