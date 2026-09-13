package net.javaguides.springboot.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import net.javaguides.springboot.entity.LeaveBalance;
import net.javaguides.springboot.entity.enums.LeaveType;

@Repository
public interface LeaveBalanceRepository
        extends JpaRepository<LeaveBalance, Long> {

    List<LeaveBalance> findByEmployeeIdOrderByLeaveTypeAsc(
            Long employeeId
    );

    Optional<LeaveBalance> findByEmployeeIdAndLeaveType(
            Long employeeId,
            LeaveType leaveType
    );
}