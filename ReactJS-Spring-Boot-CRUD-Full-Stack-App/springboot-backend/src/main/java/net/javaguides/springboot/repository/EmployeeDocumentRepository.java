package net.javaguides.springboot.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import net.javaguides.springboot.entity.EmployeeDocument;
import net.javaguides.springboot.entity.enums.DocumentStatus;
import net.javaguides.springboot.entity.enums.DocumentType;

@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {

    List<EmployeeDocument> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<EmployeeDocument> findByEmployeeIdAndStatusOrderByCreatedAtDesc(
            Long employeeId,
            DocumentStatus status
    );

    Optional<EmployeeDocument> findByIdAndEmployeeId(Long id, Long employeeId);

    long countByStatus(DocumentStatus status);

    long countByDocumentType(DocumentType documentType);
}