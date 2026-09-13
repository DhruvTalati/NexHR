package net.javaguides.springboot.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import net.javaguides.springboot.dto.AttendanceResponseDto;
import net.javaguides.springboot.service.AttendanceService;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {

        this.attendanceService = attendanceService;
    }

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponseDto> checkIn(
            Authentication authentication) {

        return ResponseEntity.ok(
                attendanceService.checkIn(
                        authentication.getName()
                )
        );
    }

    @PostMapping("/check-out")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponseDto> checkOut(
            Authentication authentication) {

        return ResponseEntity.ok(
                attendanceService.checkOut(
                        authentication.getName()
                )
        );
    }

    @GetMapping("/today")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponseDto> getTodayAttendance(
            Authentication authentication) {

        AttendanceResponseDto attendance =
                attendanceService.getTodayAttendance(
                        authentication.getName()
                );

        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<AttendanceResponseDto>> getMyAttendanceHistory(
            Authentication authentication) {

        return ResponseEntity.ok(
                attendanceService.getMyAttendanceHistory(
                        authentication.getName()
                )
        );
    }

    @GetMapping("/my-history/range")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<AttendanceResponseDto>> getMyAttendanceHistoryByRange(
            Authentication authentication,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return ResponseEntity.ok(
                attendanceService.getMyAttendanceHistory(
                        authentication.getName(),
                        startDate,
                        endDate
                )
        );
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<AttendanceResponseDto>> getEmployeeAttendance(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                attendanceService.getEmployeeAttendance(
                        employeeId
                )
        );
    }

    @GetMapping("/employee/{employeeId}/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<AttendanceResponseDto>> getEmployeeAttendanceByRange(
            @PathVariable Long employeeId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return ResponseEntity.ok(
                attendanceService.getEmployeeAttendance(
                        employeeId,
                        startDate,
                        endDate
                )
        );
    }

    @GetMapping("/today/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<AttendanceResponseDto>> getTodayAllAttendance() {

        return ResponseEntity.ok(
                attendanceService.getTodayAllAttendance()
        );
    }

    @GetMapping("/today/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Long> getTodayCount(
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(
                attendanceService.getTodayCount(status)
        );
    }

    /*
     * HR/Admin attendance dashboard statistics.
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {

        return ResponseEntity.ok(
                Map.of(
                        "totalEmployees",
                        attendanceService.getTotalEmployees(),

                        "present",
                        attendanceService.getTodayPresentCount(),

                        "late",
                        attendanceService.getTodayLateCount(),

                        "halfDay",
                        attendanceService.getTodayHalfDayCount(),

                        "absent",
                        attendanceService.getTodayAbsentCount(),

                        "attendancePercentage",
                        attendanceService.getTodayAttendancePercentage()
                )
        );
    }
}