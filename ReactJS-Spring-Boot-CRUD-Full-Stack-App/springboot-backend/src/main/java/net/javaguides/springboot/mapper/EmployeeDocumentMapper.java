package net.javaguides.springboot.mapper;

import org.springframework.stereotype.Component;

import net.javaguides.springboot.dto.EmployeeDocumentResponseDto;
import net.javaguides.springboot.entity.EmployeeDocument;

@Component
public class EmployeeDocumentMapper {

    public EmployeeDocumentResponseDto toResponseDto(EmployeeDocument document) {

        EmployeeDocumentResponseDto dto = new EmployeeDocumentResponseDto();

        dto.setId(document.getId());

        if (document.getEmployee() != null) {
            dto.setEmployeeId(document.getEmployee().getId());
            dto.setEmployeeCode(document.getEmployee().getEmployeeCode());
        }

        dto.setDocumentType(document.getDocumentType());
        dto.setOriginalFileName(document.getOriginalFileName());
        dto.setContentType(document.getContentType());
        dto.setFileSize(document.getFileSize());
        dto.setExpiryDate(document.getExpiryDate());

        dto.setStatus(document.getStatus());
        dto.setRejectionReason(document.getRejectionReason());

        dto.setUploadedBy(document.getUploadedBy());
        dto.setVerifiedBy(document.getVerifiedBy());

        dto.setVerifiedAt(document.getVerifiedAt());
        dto.setCreatedAt(document.getCreatedAt());
        dto.setUpdatedAt(document.getUpdatedAt());

        return dto;
    }
}