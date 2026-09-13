package net.javaguides.springboot.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import net.javaguides.springboot.dto.EmployeeDocumentResponseDto;
import net.javaguides.springboot.entity.Employee;
import net.javaguides.springboot.entity.EmployeeDocument;
import net.javaguides.springboot.entity.enums.DocumentStatus;
import net.javaguides.springboot.entity.enums.DocumentType;
import net.javaguides.springboot.exception.DocumentNotFoundException;
import net.javaguides.springboot.exception.DocumentStorageException;
import net.javaguides.springboot.exception.EmployeeNotFoundException;
import net.javaguides.springboot.mapper.EmployeeDocumentMapper;
import net.javaguides.springboot.repository.EmployeeDocumentRepository;
import net.javaguides.springboot.repository.EmployeeRepository;
import net.javaguides.springboot.service.DocumentStorageService;
import net.javaguides.springboot.service.EmployeeDocumentService;

@Service
@Transactional
public class EmployeeDocumentServiceImpl implements EmployeeDocumentService {

    private final EmployeeDocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeDocumentMapper documentMapper;
    private final DocumentStorageService storageService;

    public EmployeeDocumentServiceImpl(
            EmployeeDocumentRepository documentRepository,
            EmployeeRepository employeeRepository,
            EmployeeDocumentMapper documentMapper,
            DocumentStorageService storageService) {

        this.documentRepository = documentRepository;
        this.employeeRepository = employeeRepository;
        this.documentMapper = documentMapper;
        this.storageService = storageService;
    }

    @Override
    public EmployeeDocumentResponseDto uploadDocument(
            Long employeeId,
            MultipartFile file,
            DocumentType documentType,
            LocalDate expiryDate,
            String uploadedBy) {

        if (file == null || file.isEmpty()) {
            throw new DocumentStorageException(
                    "Please select a file to upload"
            );
        }

        if (documentType == null) {
            throw new IllegalArgumentException(
                    "Document type is required"
            );
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new DocumentStorageException(
                    "File size must not exceed 10 MB"
            );
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with id : " + employeeId
                        )
                );

        validateFileType(file);

        DocumentStorageService.StoredFile storedFile =
                storageService.store(employeeId, file);

        try {
            EmployeeDocument document = new EmployeeDocument();

            document.setEmployee(employee);
            document.setDocumentType(documentType);

            document.setOriginalFileName(
                    sanitizeOriginalFilename(
                            file.getOriginalFilename()
                    )
            );

            document.setStoredFileName(
                    storedFile.storedFilename()
            );

            document.setFilePath(
                    storedFile.relativePath()
            );

            document.setContentType(
                    file.getContentType() != null
                            ? file.getContentType()
                            : "application/octet-stream"
            );

            document.setFileSize(file.getSize());
            document.setExpiryDate(expiryDate);

            document.setStatus(DocumentStatus.PENDING);
            document.setUploadedBy(uploadedBy);

            EmployeeDocument saved =
                    documentRepository.save(document);

            return documentMapper.toResponseDto(saved);

        } catch (RuntimeException ex) {

            // If database persistence fails after the physical
            // file was created, remove the physical file.
            try {
                storageService.delete(
                        storedFile.relativePath()
                );
            } catch (RuntimeException cleanupException) {
                ex.addSuppressed(cleanupException);
            }

            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDocumentResponseDto> getEmployeeDocuments(
            Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new EmployeeNotFoundException(
                    "Employee not found with id : " + employeeId
            );
        }

        return documentRepository
                .findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(documentMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDocumentResponseDto getDocument(Long documentId) {

        EmployeeDocument document =
                findDocumentOrThrow(documentId);

        return documentMapper.toResponseDto(document);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadDocument(Long documentId) {

        EmployeeDocument document =
                findDocumentOrThrow(documentId);

        return readDocumentFile(document);
    }

    @Override
    @Transactional(readOnly = true)
    public String getDownloadContentType(Long documentId) {

        EmployeeDocument document =
                findDocumentOrThrow(documentId);

        return document.getContentType();
    }

    @Override
    @Transactional(readOnly = true)
    public String getDownloadFileName(Long documentId) {

        EmployeeDocument document =
                findDocumentOrThrow(documentId);

        return document.getOriginalFileName();
    }

    @Override
    public void deleteDocument(Long documentId) {

        EmployeeDocument document =
                findDocumentOrThrow(documentId);

        String filePath = document.getFilePath();

        documentRepository.delete(document);

        try {
            storageService.delete(filePath);
        } catch (RuntimeException ex) {
            throw new DocumentStorageException(
                    "Document record was deleted, but the physical "
                            + "file could not be removed",
                    ex
            );
        }
    }

    @Override
    public EmployeeDocumentResponseDto verifyDocument(
            Long documentId,
            String verifiedBy) {

        EmployeeDocument document =
                findDocumentOrThrow(documentId);

        document.setStatus(DocumentStatus.VERIFIED);
        document.setRejectionReason(null);
        document.setVerifiedBy(verifiedBy);
        document.setVerifiedAt(LocalDateTime.now());

        return documentMapper.toResponseDto(
                documentRepository.save(document)
        );
    }

    @Override
    public EmployeeDocumentResponseDto rejectDocument(
            Long documentId,
            String rejectionReason,
            String verifiedBy) {

        if (rejectionReason == null ||
                rejectionReason.isBlank()) {

            throw new IllegalArgumentException(
                    "Rejection reason is required"
            );
        }

        EmployeeDocument document =
                findDocumentOrThrow(documentId);

        document.setStatus(DocumentStatus.REJECTED);
        document.setRejectionReason(
                rejectionReason.trim()
        );
        document.setVerifiedBy(verifiedBy);
        document.setVerifiedAt(LocalDateTime.now());

        return documentMapper.toResponseDto(
                documentRepository.save(document)
        );
    }

    /*
     * ============================================================
     * EMPLOYEE SELF-SERVICE
     * ============================================================
     */

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDocumentResponseDto> getMyDocuments(
            String email) {

        Employee employee =
                findEmployeeByEmail(email);

        return documentRepository
                .findByEmployeeIdOrderByCreatedAtDesc(
                        employee.getId()
                )
                .stream()
                .map(documentMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadMyDocument(
            Long documentId,
            String email) {

        Employee employee =
                findEmployeeByEmail(email);

        EmployeeDocument document =
                findDocumentForEmployeeOrThrow(
                        documentId,
                        employee.getId()
                );

        return readDocumentFile(document);
    }

    @Override
    @Transactional(readOnly = true)
    public String getMyDownloadContentType(
            Long documentId,
            String email) {

        Employee employee =
                findEmployeeByEmail(email);

        EmployeeDocument document =
                findDocumentForEmployeeOrThrow(
                        documentId,
                        employee.getId()
                );

        return document.getContentType();
    }

    @Override
    @Transactional(readOnly = true)
    public String getMyDownloadFileName(
            Long documentId,
            String email) {

        Employee employee =
                findEmployeeByEmail(email);

        EmployeeDocument document =
                findDocumentForEmployeeOrThrow(
                        documentId,
                        employee.getId()
                );

        return document.getOriginalFileName();
    }

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(DocumentStatus status) {
        return documentRepository.countByStatus(status);
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

    private EmployeeDocument findDocumentForEmployeeOrThrow(
            Long documentId,
            Long employeeId) {

        return documentRepository
                .findByIdAndEmployeeId(
                        documentId,
                        employeeId
                )
                .orElseThrow(() ->
                        new DocumentNotFoundException(
                                "Document not found"
                        )
                );
    }

    private EmployeeDocument findDocumentOrThrow(
            Long documentId) {

        return documentRepository.findById(documentId)
                .orElseThrow(() ->
                        new DocumentNotFoundException(
                                "Document not found with id : "
                                        + documentId
                        )
                );
    }

    private byte[] readDocumentFile(
            EmployeeDocument document) {

        Path path = storageService.load(
                document.getFilePath()
        );

        try {
            if (!Files.exists(path)) {
                throw new DocumentStorageException(
                        "Document file is missing from storage"
                );
            }

            return Files.readAllBytes(path);

        } catch (IOException ex) {
            throw new DocumentStorageException(
                    "Could not read document file",
                    ex
            );
        }
    }

    private void validateFileType(MultipartFile file) {

        String contentType = file.getContentType();

        if (contentType == null) {
            throw new DocumentStorageException(
                    "Unable to determine file type"
            );
        }

        boolean supported =
                switch (contentType.toLowerCase()) {

                    case "application/pdf",
                         "image/jpeg",
                         "image/png",
                         "application/msword",
                         "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            -> true;

                    default -> false;
                };

        if (!supported) {
            throw new DocumentStorageException(
                    "Unsupported file type. Allowed types: "
                            + "PDF, JPG, JPEG, PNG, DOC and DOCX"
            );
        }
    }

    private String sanitizeOriginalFilename(
            String filename) {

        if (filename == null || filename.isBlank()) {
            return "document";
        }

        String sanitized = Path.of(filename)
                .getFileName()
                .toString()
                .trim();

        if (sanitized.length() > 255) {
            sanitized = sanitized.substring(0, 255);
        }

        return sanitized;
    }
}