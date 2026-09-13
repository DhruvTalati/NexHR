package net.javaguides.springboot.exception;

/**
 * Thrown for malformed or business-rule-invalid requests that aren't a
 * simple field-validation failure (those are handled separately via
 * Bean Validation) and aren't a not-found or duplicate case.
 *
 * Not yet thrown anywhere in Phase C - reserved for business-rule checks
 * added in later phases, e.g. preventing department deletion while
 * employees are still assigned to it (Phase 9).
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
