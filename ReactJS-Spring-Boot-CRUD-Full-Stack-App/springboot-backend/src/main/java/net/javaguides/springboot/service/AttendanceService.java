package net.javaguides.springboot.service;

import java.time.LocalDate;
import java.util.List;

import net.javaguides.springboot.dto.AttendanceResponseDto;

public interface AttendanceService {

    AttendanceResponseDto checkIn(String email);

    AttendanceResponseDto checkOut(String email);

    AttendanceResponseDto getTodayAttendance(String email);

    List<AttendanceResponseDto> getMyAttendanceHistory(String email);

    List<AttendanceResponseDto> getMyAttendanceHistory(
            String email,
            LocalDate startDate,
            LocalDate endDate
    );

    List<AttendanceResponseDto> getEmployeeAttendance(
            Long employeeId
    );

    List<AttendanceResponseDto> getEmployeeAttendance(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<AttendanceResponseDto> getTodayAllAttendance();

    long getTodayCount(String status);

    long getTotalEmployees();

    long getTodayPresentCount();

    long getTodayLateCount();

    long getTodayHalfDayCount();

    long getTodayAbsentCount();

    double getTodayAttendancePercentage();
}