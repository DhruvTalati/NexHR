package net.javaguides.springboot.mapper;

import org.springframework.stereotype.Component;

import net.javaguides.springboot.dto.LeaveResponseDto;
import net.javaguides.springboot.entity.Employee;
import net.javaguides.springboot.entity.LeaveRequest;

@Component
public class LeaveRequestMapper {

    public LeaveResponseDto toResponseDto(
            LeaveRequest leaveRequest) {

        LeaveResponseDto dto =
                new LeaveResponseDto();

        dto.setId(leaveRequest.getId());

        Employee employee =
                leaveRequest.getEmployee();

        if (employee != null) {
            dto.setEmployeeId(employee.getId());
            dto.setEmployeeCode(
                    employee.getEmployeeCode()
            );

            String firstName =
                    employee.getFirstName();

            String lastName =
                    employee.getLastName();

            String employeeName =
                    ((firstName == null ? "" : firstName)
                    + " "
                    + (lastName == null ? "" : lastName))
                    .trim();

            dto.setEmployeeName(
                    employeeName.isBlank()
                            ? "Employee"
                            : employeeName
            );
        }

        dto.setLeaveType(
                leaveRequest.getLeaveType()
        );

        dto.setStartDate(
                leaveRequest.getStartDate()
        );

        dto.setEndDate(
                leaveRequest.getEndDate()
        );

        dto.setTotalDays(
                leaveRequest.getTotalDays()
        );

        dto.setReason(
                leaveRequest.getReason()
        );

        dto.setStatus(
                leaveRequest.getStatus()
        );

        dto.setReviewedBy(
                leaveRequest.getReviewedBy()
        );

        dto.setReviewedAt(
                leaveRequest.getReviewedAt()
        );

        dto.setRejectionReason(
                leaveRequest.getRejectionReason()
        );

        dto.setCreatedAt(
                leaveRequest.getCreatedAt()
        );

        dto.setUpdatedAt(
                leaveRequest.getUpdatedAt()
        );

        return dto;
    }
}