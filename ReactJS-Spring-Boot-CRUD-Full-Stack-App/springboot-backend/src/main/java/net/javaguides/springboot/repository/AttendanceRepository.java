package net.javaguides.springboot.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import net.javaguides.springboot.entity.Attendance;
import net.javaguides.springboot.entity.enums.AttendanceStatus;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeIdAndAttendanceDate(
            Long employeeId,
            LocalDate attendanceDate
    );

    List<Attendance> findByEmployeeIdOrderByAttendanceDateDesc(
            Long employeeId
    );

    List<Attendance> findByAttendanceDateOrderByCheckInAsc(
            LocalDate attendanceDate
    );

    List<Attendance> findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate
    );

    long countByAttendanceDateAndStatus(
            LocalDate attendanceDate,
            AttendanceStatus status
    );

    long countByStatus(AttendanceStatus status);

    boolean existsByEmployeeIdAndAttendanceDate(
            Long employeeId,
            LocalDate attendanceDate
    );
}