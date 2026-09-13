package net.javaguides.springboot.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import net.javaguides.springboot.dto.EmployeeDocumentResponseDto;
import net.javaguides.springboot.entity.enums.DocumentType;
import net.javaguides.springboot.service.EmployeeDocumentService;

@RestController
@RequestMapping("/api/v1")
public class EmployeeDocumentController {

    private final EmployeeDocumentService documentService;

    public EmployeeDocumentController(EmployeeDocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Upload a document for an employee.
     *
     * ADMIN and HR can upload documents for any employee.
     */
    @PostMapping(
            value = "/employees/{employeeId}/documents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeDocumentResponseDto> uploadDocument(
            @PathVariable Long employeeId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam(value = "expiryDate", required = false) LocalDate expiryDate,
            Authentication authentication) {

        EmployeeDocumentResponseDto response =
                documentService.uploadDocument(
                        employeeId,
                        file,
                        documentType,
                        expiryDate,
                        authentication.getName()
                );

        return ResponseEntity.ok(response);
    }

    /**
     * List all documents belonging to an employee.
     *
     * ADMIN and HR can inspect employee documents.
     */
    @GetMapping("/employees/{employeeId}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<EmployeeDocumentResponseDto>> getEmployeeDocuments(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                documentService.getEmployeeDocuments(employeeId)
        );
    }

    /**
     * Get document metadata.
     */
    @GetMapping("/documents/{documentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeDocumentResponseDto> getDocument(
            @PathVariable Long documentId) {

        return ResponseEntity.ok(
                documentService.getDocument(documentId)
        );
    }

    /**
     * Download the physical document.
     */
    @GetMapping("/documents/{documentId}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ByteArrayResource> downloadDocument(
            @PathVariable Long documentId) {

        byte[] data =
                documentService.downloadDocument(documentId);

        String contentType =
                documentService.getDownloadContentType(documentId);

        String fileName =
                documentService.getDownloadFileName(documentId);

        MediaType mediaType;

        try {
            mediaType = MediaType.parseMediaType(contentType);
        } catch (Exception ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        ByteArrayResource resource =
                new ByteArrayResource(data);

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(mediaType);

        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename(fileName)
                        .build()
        );

        headers.setContentLength(data.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(resource);
    }

    /**
     * Delete a document.
     */
    @DeleteMapping("/documents/{documentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long documentId) {

        documentService.deleteDocument(documentId);

        return ResponseEntity.noContent().build();
    }

    /**
     * Verify a pending document.
     */
    @PutMapping("/documents/{documentId}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeDocumentResponseDto> verifyDocument(
            @PathVariable Long documentId,
            Authentication authentication) {

        return ResponseEntity.ok(
                documentService.verifyDocument(
                        documentId,
                        authentication.getName()
                )
        );
    }

    /**
     * Reject a document with a mandatory reason.
     */
    @PutMapping("/documents/{documentId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeDocumentResponseDto> rejectDocument(
            @PathVariable Long documentId,
            @RequestParam("reason") String reason,
            Authentication authentication) {

        return ResponseEntity.ok(
                documentService.rejectDocument(
                        documentId,
                        reason,
                        authentication.getName()
                )
        );
    }
}