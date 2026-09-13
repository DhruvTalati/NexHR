package net.javaguides.springboot.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.springboot.dto.AttendanceResponseDto;
import net.javaguides.springboot.entity.Attendance;
import net.javaguides.springboot.entity.Employee;
import net.javaguides.springboot.entity.enums.AttendanceStatus;
import net.javaguides.springboot.exception.EmployeeNotFoundException;
import net.javaguides.springboot.mapper.AttendanceMapper;
import net.javaguides.springboot.repository.AttendanceRepository;
import net.javaguides.springboot.repository.EmployeeRepository;
import net.javaguides.springboot.service.AttendanceService;

@Service
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private static final LocalTime STANDARD_WORK_START_TIME =
            LocalTime.of(9, 0);

    private static final BigDecimal HALF_DAY_HOURS =
            BigDecimal.valueOf(4.0);

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceMapper attendanceMapper;

    public AttendanceServiceImpl(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository,
            AttendanceMapper attendanceMapper) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceMapper = attendanceMapper;
    }

    @Override
    public AttendanceResponseDto checkIn(String email) {

        Employee employee = findEmployeeByEmail(email);

        LocalDate today = LocalDate.now();

        Attendance existing =
                attendanceRepository
                        .findByEmployeeIdAndAttendanceDate(
                                employee.getId(),
                                today
                        )
                        .orElse(null);

        if (existing != null && existing.getCheckIn() != null) {
            throw new IllegalStateException(
                    "You have already checked in today"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        Attendance attendance;

        if (existing != null) {
            attendance = existing;
        } else {
            attendance = new Attendance();
            attendance.setEmployee(employee);
            attendance.setAttendanceDate(today);
        }

        attendance.setCheckIn(now);

        if (now.toLocalTime()
                .isAfter(STANDARD_WORK_START_TIME)) {

            attendance.setStatus(
                    AttendanceStatus.LATE
            );
        } else {
            attendance.setStatus(
                    AttendanceStatus.PRESENT
            );
        }

        Attendance saved =
                attendanceRepository.save(attendance);

        return attendanceMapper.toResponseDto(saved);
    }

    @Override
    public AttendanceResponseDto checkOut(String email) {

        Employee employee = findEmployeeByEmail(email);

        LocalDate today = LocalDate.now();

        Attendance attendance =
                attendanceRepository
                        .findByEmployeeIdAndAttendanceDate(
                                employee.getId(),
                                today
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "You have not checked in today"
                                )
                        );

        if (attendance.getCheckIn() == null) {
            throw new IllegalStateException(
                    "You have not checked in today"
            );
        }

        if (attendance.getCheckOut() != null) {
            throw new IllegalStateException(
                    "You have already checked out today"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        attendance.setCheckOut(now);

        Duration duration =
                Duration.between(
                        attendance.getCheckIn(),
                        now
                );

        BigDecimal workingHours =
                BigDecimal.valueOf(
                        duration.toMinutes() / 60.0
                ).setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        attendance.setWorkingHours(workingHours);

        if (workingHours.compareTo(HALF_DAY_HOURS) < 0) {
            attendance.setStatus(
                    AttendanceStatus.HALF_DAY
            );
        } else if (attendance.getStatus()
                != AttendanceStatus.LATE) {

            attendance.setStatus(
                    AttendanceStatus.PRESENT
            );
        }

        Attendance saved =
                attendanceRepository.save(attendance);

        return attendanceMapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponseDto getTodayAttendance(
            String email) {

        Employee employee = findEmployeeByEmail(email);

        return attendanceRepository
                .findByEmployeeIdAndAttendanceDate(
                        employee.getId(),
                        LocalDate.now()
                )
                .map(attendanceMapper::toResponseDto)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> getMyAttendanceHistory(
            String email) {

        Employee employee = findEmployeeByEmail(email);

        return attendanceRepository
                .findByEmployeeIdOrderByAttendanceDateDesc(
                        employee.getId()
                )
                .stream()
                .map(attendanceMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> getMyAttendanceHistory(
            String email,
            LocalDate startDate,
            LocalDate endDate) {

        Employee employee = findEmployeeByEmail(email);

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }

        return attendanceRepository
                .findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
                        employee.getId(),
                        startDate,
                        endDate
                )
                .stream()
                .map(attendanceMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> getEmployeeAttendance(
            Long employeeId) {

        verifyEmployeeExists(employeeId);

        return attendanceRepository
                .findByEmployeeIdOrderByAttendanceDateDesc(
                        employeeId
                )
                .stream()
                .map(attendanceMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> getEmployeeAttendance(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate) {

        verifyEmployeeExists(employeeId);

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }

        return attendanceRepository
                .findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
                        employeeId,
                        startDate,
                        endDate
                )
                .stream()
                .map(attendanceMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> getTodayAllAttendance() {

        return attendanceRepository
                .findByAttendanceDateOrderByCheckInAsc(
                        LocalDate.now()
                )
                .stream()
                .map(attendanceMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getTodayCount(String status) {

        LocalDate today = LocalDate.now();

        if (status == null || status.isBlank()) {
            return attendanceRepository
                    .findByAttendanceDateOrderByCheckInAsc(
                            today
                    )
                    .size();
        }

        AttendanceStatus attendanceStatus;

        try {
            attendanceStatus =
                    AttendanceStatus.valueOf(
                            status.toUpperCase()
                    );
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid attendance status: " + status
            );
        }

        return attendanceRepository
                .countByAttendanceDateAndStatus(
                        today,
                        attendanceStatus
                );
    }

    /*
     * ============================================================
     * HR ATTENDANCE DASHBOARD
     * ============================================================
     */

    @Override
    @Transactional(readOnly = true)
    public long getTotalEmployees() {

        return employeeRepository.count();
    }

    @Override
    @Transactional(readOnly = true)
    public long getTodayPresentCount() {

        return attendanceRepository
                .countByAttendanceDateAndStatus(
                        LocalDate.now(),
                        AttendanceStatus.PRESENT
                );
    }

    @Override
    @Transactional(readOnly = true)
    public long getTodayLateCount() {

        return attendanceRepository
                .countByAttendanceDateAndStatus(
                        LocalDate.now(),
                        AttendanceStatus.LATE
                );
    }

    @Override
    @Transactional(readOnly = true)
    public long getTodayHalfDayCount() {

        return attendanceRepository
                .countByAttendanceDateAndStatus(
                        LocalDate.now(),
                        AttendanceStatus.HALF_DAY
                );
    }

    @Override
    @Transactional(readOnly = true)
    public long getTodayAbsentCount() {

        long totalEmployees =
                employeeRepository.count();

        long recordedAttendance =
                attendanceRepository
                        .findByAttendanceDateOrderByCheckInAsc(
                                LocalDate.now()
                        )
                        .size();

        return Math.max(
                totalEmployees - recordedAttendance,
                0
        );
    }

    @Override
    @Transactional(readOnly = true)
    public double getTodayAttendancePercentage() {

        long totalEmployees =
                employeeRepository.count();

        if (totalEmployees == 0) {
            return 0.0;
        }

        long attendedEmployees =
                attendanceRepository
                        .findByAttendanceDateOrderByCheckInAsc(
                                LocalDate.now()
                        )
                        .size();

        return BigDecimal.valueOf(
                (attendedEmployees * 100.0)
                        / totalEmployees
        ).setScale(
                2,
                RoundingMode.HALF_UP
        ).doubleValue();
    }

    /*
     * ============================================================
     * HELPERS
     * ============================================================
     */

    private Employee findEmployeeByEmail(String email) {

        return employeeRepository.findByEmail(email)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "No employee profile linked to email: "
                                        + email
                        )
                );
    }

    private void verifyEmployeeExists(
            Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new EmployeeNotFoundException(
                    "Employee not found with id : "
                            + employeeId
            );
        }
    }
}