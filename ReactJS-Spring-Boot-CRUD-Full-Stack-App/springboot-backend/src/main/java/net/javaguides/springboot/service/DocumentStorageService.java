package net.javaguides.springboot.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.javaguides.springboot.exception.DocumentStorageException;

@Service
public class DocumentStorageService {

    private final Path rootLocation;

    public DocumentStorageService(
            @Value("${app.file-storage.location:./uploads/documents}") String storageLocation) {

        this.rootLocation = Paths.get(storageLocation)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException ex) {
            throw new DocumentStorageException(
                    "Could not initialize document storage location: "
                            + this.rootLocation,
                    ex
            );
        }
    }

    public StoredFile store(Long employeeId, MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new DocumentStorageException("Uploaded file is empty");
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || originalFilename.isBlank()) {
            throw new DocumentStorageException("Uploaded file has no valid filename");
        }

        String extension = getExtension(originalFilename);

        String storedFilename = UUID.randomUUID()
                .toString()
                .replace("-", "")
                + extension;

        Path employeeDirectory = rootLocation
                .resolve("employee-" + employeeId)
                .normalize();

        ensureInsideRoot(employeeDirectory);

        try {
            Files.createDirectories(employeeDirectory);

            Path target = employeeDirectory
                    .resolve(storedFilename)
                    .normalize();

            ensureInsideRoot(target);

            Files.copy(
                    file.getInputStream(),
                    target,
                    StandardCopyOption.REPLACE_EXISTING
            );

            String relativePath = rootLocation
                    .relativize(target)
                    .toString()
                    .replace("\\", "/");

            return new StoredFile(
                    originalFilename,
                    storedFilename,
                    relativePath
            );

        } catch (IOException ex) {
            throw new DocumentStorageException(
                    "Failed to store document: " + originalFilename,
                    ex
            );
        }
    }

    public Path load(String relativePath) {

        if (relativePath == null || relativePath.isBlank()) {
            throw new DocumentStorageException("Invalid document path");
        }

        Path resolved = rootLocation
                .resolve(relativePath)
                .normalize();

        ensureInsideRoot(resolved);

        return resolved;
    }

    public void delete(String relativePath) {

        Path path = load(relativePath);

        try {
            Files.deleteIfExists(path);
        } catch (IOException ex) {
            throw new DocumentStorageException(
                    "Failed to delete stored document",
                    ex
            );
        }
    }

    private String getExtension(String filename) {

        String cleanName = Paths.get(filename)
                .getFileName()
                .toString();

        int dotIndex = cleanName.lastIndexOf('.');

        if (dotIndex < 0 || dotIndex == cleanName.length() - 1) {
            return "";
        }

        return cleanName
                .substring(dotIndex)
                .toLowerCase();
    }

    private void ensureInsideRoot(Path path) {

        if (!path.startsWith(rootLocation)) {
            throw new DocumentStorageException(
                    "Invalid document storage path"
            );
        }
    }

    public record StoredFile(
            String originalFilename,
            String storedFilename,
            String relativePath
    ) {
    }
}