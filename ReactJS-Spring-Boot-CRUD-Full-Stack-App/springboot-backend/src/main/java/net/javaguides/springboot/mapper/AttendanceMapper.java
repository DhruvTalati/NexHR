package net.javaguides.springboot.mapper;

import org.springframework.stereotype.Component;

import net.javaguides.springboot.dto.AttendanceResponseDto;
import net.javaguides.springboot.entity.Attendance;
import net.javaguides.springboot.entity.Employee;

@Component
public class AttendanceMapper {

    public AttendanceResponseDto toResponseDto(
            Attendance attendance) {

        AttendanceResponseDto dto =
                new AttendanceResponseDto();

        dto.setId(attendance.getId());
        dto.setAttendanceDate(
                attendance.getAttendanceDate()
        );
        dto.setCheckIn(attendance.getCheckIn());
        dto.setCheckOut(attendance.getCheckOut());
        dto.setWorkingHours(
                attendance.getWorkingHours()
        );
        dto.setStatus(attendance.getStatus());
        dto.setRemarks(attendance.getRemarks());

        Employee employee = attendance.getEmployee();

        if (employee != null) {
            dto.setEmployeeId(employee.getId());
            dto.setEmployeeCode(
                    employee.getEmployeeCode()
            );

            String firstName = employee.getFirstName();
            String lastName = employee.getLastName();

            String employeeName =
                    ((firstName == null ? "" : firstName) + " " +
                    (lastName == null ? "" : lastName))
                    .trim();

            dto.setEmployeeName(
                    employeeName.isBlank()
                            ? "Employee"
                            : employeeName
            );
        }

        return dto;
    }
}