package net.javaguides.springboot.service;

import java.util.List;

import net.javaguides.springboot.dto.LeaveRequestDto;
import net.javaguides.springboot.dto.LeaveResponseDto;

public interface LeaveRequestService {

    LeaveResponseDto applyLeave(
            String email,
            LeaveRequestDto request
    );

    List<LeaveResponseDto> getMyLeaves(
            String email
    );

    LeaveResponseDto getMyLeave(
            String email,
            Long leaveId
    );

    void cancelLeave(
            String email,
            Long leaveId
    );

    List<LeaveResponseDto> getAllLeaves();

    List<LeaveResponseDto> getPendingLeaves();

    LeaveResponseDto approveLeave(
            Long leaveId,
            String reviewedBy
    );

    LeaveResponseDto rejectLeave(
            Long leaveId,
            String rejectionReason,
            String reviewedBy
    );

    long countPending();

    long countApproved();

    long countRejected();
}