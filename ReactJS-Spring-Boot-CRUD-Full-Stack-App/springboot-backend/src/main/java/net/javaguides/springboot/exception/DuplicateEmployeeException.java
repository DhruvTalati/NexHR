package net.javaguides.springboot.exception;

/**
 * Thrown when an operation would violate a business uniqueness rule
 * (e.g. creating or updating an employee with an email already in use).
 * Handled centrally by GlobalExceptionHandler, mapped to 409 Conflict.
 */
public class DuplicateEmployeeException extends RuntimeException {

    public DuplicateEmployeeException(String message) {
        super(message);
    }
}
