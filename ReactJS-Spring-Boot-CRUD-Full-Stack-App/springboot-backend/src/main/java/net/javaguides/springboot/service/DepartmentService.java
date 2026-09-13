package net.javaguides.springboot.service;

import java.util.List;

import net.javaguides.springboot.dto.DepartmentRequestDto;
import net.javaguides.springboot.dto.DepartmentResponseDto;

public interface DepartmentService {

    List<DepartmentResponseDto> getAllDepartments();

    DepartmentResponseDto getDepartmentById(Long id);

    DepartmentResponseDto createDepartment(DepartmentRequestDto requestDto);

    DepartmentResponseDto updateDepartment(Long id, DepartmentRequestDto requestDto);

    void deleteDepartment(Long id);
}
