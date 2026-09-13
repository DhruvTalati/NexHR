package net.javaguides.springboot.exception;

/**
 * Thrown when an employee lookup by id fails. Handled centrally by
 * GlobalExceptionHandler, which maps it to a 404 response - the exception
 * itself carries no HTTP concerns.
 */
public class EmployeeNotFoundException extends RuntimeException {

    public EmployeeNotFoundException(String message) {
        super(message);
    }
}
