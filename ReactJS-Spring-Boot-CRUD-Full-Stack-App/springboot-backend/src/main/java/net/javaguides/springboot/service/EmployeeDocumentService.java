package net.javaguides.springboot.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import net.javaguides.springboot.dto.EmployeeDocumentResponseDto;
import net.javaguides.springboot.entity.enums.DocumentStatus;
import net.javaguides.springboot.entity.enums.DocumentType;

public interface EmployeeDocumentService {

    EmployeeDocumentResponseDto uploadDocument(
            Long employeeId,
            MultipartFile file,
            DocumentType documentType,
            LocalDate expiryDate,
            String uploadedBy
    );

    List<EmployeeDocumentResponseDto> getEmployeeDocuments(Long employeeId);

    EmployeeDocumentResponseDto getDocument(Long documentId);

    byte[] downloadDocument(Long documentId);

    String getDownloadContentType(Long documentId);

    String getDownloadFileName(Long documentId);

    void deleteDocument(Long documentId);

    EmployeeDocumentResponseDto verifyDocument(
            Long documentId,
            String verifiedBy
    );

    EmployeeDocumentResponseDto rejectDocument(
            Long documentId,
            String rejectionReason,
            String verifiedBy
    );

    /*
     * Employee self-service:
     * An employee can access only documents belonging
     * to the employee record linked to their login email.
     */
    List<EmployeeDocumentResponseDto> getMyDocuments(String email);

    byte[] downloadMyDocument(
            Long documentId,
            String email
    );

    String getMyDownloadContentType(
            Long documentId,
            String email
    );

    String getMyDownloadFileName(
            Long documentId,
            String email
    );

    long countByStatus(DocumentStatus status);
}