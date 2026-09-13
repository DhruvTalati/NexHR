package net.javaguides.springboot.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import net.javaguides.springboot.dto.LeaveRequestDto;
import net.javaguides.springboot.dto.LeaveResponseDto;
import net.javaguides.springboot.service.LeaveRequestService;

@RestController
@RequestMapping("/api/v1/leaves")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(
            LeaveRequestService leaveRequestService) {

        this.leaveRequestService = leaveRequestService;
    }

    /*
     * ============================================================
     * EMPLOYEE SELF-SERVICE
     * ============================================================
     */

    /**
     * Submit a new leave request.
     */
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveResponseDto> applyLeave(
            @RequestBody LeaveRequestDto request,
            Authentication authentication) {

        return ResponseEntity.ok(
                leaveRequestService.applyLeave(
                        authentication.getName(),
                        request
                )
        );
    }

    /**
     * Get all leave requests belonging to
     * the currently authenticated employee.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<LeaveResponseDto>> getMyLeaves(
            Authentication authentication) {

        return ResponseEntity.ok(
                leaveRequestService.getMyLeaves(
                        authentication.getName()
                )
        );
    }

    /**
     * Get a single leave request belonging to
     * the authenticated employee.
     */
    @GetMapping("/my/{leaveId}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveResponseDto> getMyLeave(
            @PathVariable Long leaveId,
            Authentication authentication) {

        return ResponseEntity.ok(
                leaveRequestService.getMyLeave(
                        authentication.getName(),
                        leaveId
                )
        );
    }

    /**
     * Cancel a pending leave request.
     */
    @DeleteMapping("/my/{leaveId}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<Void> cancelLeave(
            @PathVariable Long leaveId,
            Authentication authentication) {

        leaveRequestService.cancelLeave(
                authentication.getName(),
                leaveId
        );

        return ResponseEntity.noContent().build();
    }

    /*
     * ============================================================
     * HR / ADMIN
     * ============================================================
     */

    /**
     * Get every leave request.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<LeaveResponseDto>> getAllLeaves() {

        return ResponseEntity.ok(
                leaveRequestService.getAllLeaves()
        );
    }

    /**
     * Get only pending leave requests.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<LeaveResponseDto>> getPendingLeaves() {

        return ResponseEntity.ok(
                leaveRequestService.getPendingLeaves()
        );
    }

    /**
     * Approve a pending leave request.
     */
    @PutMapping("/{leaveId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<LeaveResponseDto> approveLeave(
            @PathVariable Long leaveId,
            Authentication authentication) {

        return ResponseEntity.ok(
                leaveRequestService.approveLeave(
                        leaveId,
                        authentication.getName()
                )
        );
    }

    /**
     * Reject a pending leave request.
     *
     * Example:
     * PUT /api/v1/leaves/5/reject?reason=Insufficient%20notice
     */
    @PutMapping("/{leaveId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<LeaveResponseDto> rejectLeave(
            @PathVariable Long leaveId,
            @RequestParam String reason,
            Authentication authentication) {

        return ResponseEntity.ok(
                leaveRequestService.rejectLeave(
                        leaveId,
                        reason,
                        authentication.getName()
                )
        );
    }

    /**
     * Leave dashboard statistics.
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, Long>> getDashboard() {

        return ResponseEntity.ok(
                Map.of(
                        "pending",
                        leaveRequestService.countPending(),

                        "approved",
                        leaveRequestService.countApproved(),

                        "rejected",
                        leaveRequestService.countRejected(),

                        "total",
                        leaveRequestService.countPending()
                                + leaveRequestService.countApproved()
                                + leaveRequestService.countRejected()
                )
        );
    }
}