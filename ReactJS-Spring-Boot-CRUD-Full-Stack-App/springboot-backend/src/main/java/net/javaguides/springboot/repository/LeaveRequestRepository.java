package net.javaguides.springboot.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import net.javaguides.springboot.entity.LeaveRequest;
import net.javaguides.springboot.entity.enums.LeaveStatus;
import net.javaguides.springboot.entity.enums.LeaveType;

@Repository
public interface LeaveRequestRepository
        extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(
            Long employeeId
    );

    List<LeaveRequest> findByEmployeeIdAndStatusOrderByCreatedAtDesc(
            Long employeeId,
            LeaveStatus status
    );

    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(
            LeaveStatus status
    );

    Optional<LeaveRequest> findByIdAndEmployeeId(
            Long id,
            Long employeeId
    );

    long countByStatus(LeaveStatus status);

    long countByLeaveType(LeaveType leaveType);

    /**
     * Used to detect overlapping approved/pending leave.
     */
    List<LeaveRequest> findByEmployeeIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long employeeId,
            List<LeaveStatus> statuses,
            LocalDate endDate,
            LocalDate startDate
    );
}