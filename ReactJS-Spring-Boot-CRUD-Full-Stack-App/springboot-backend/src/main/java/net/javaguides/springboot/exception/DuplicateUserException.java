package net.javaguides.springboot.exception;

/**
 * Thrown when registering with an email that's already taken.
 * Same pattern as DuplicateEmployeeException, applied to user accounts.
 */
public class DuplicateUserException extends RuntimeException {

    public DuplicateUserException(String message) {
        super(message);
    }
}
