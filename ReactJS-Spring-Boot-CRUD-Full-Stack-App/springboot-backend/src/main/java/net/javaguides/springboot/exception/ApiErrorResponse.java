package net.javaguides.springboot.exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standard shape for every error response returned by the API.
 * `errors` is only populated for field-validation failures; it's null
 * for single-message errors like not-found or duplicate.
 */
public class ApiErrorResponse {

    private final LocalDateTime timestamp;
    private final int status;
    private final String message;
    private final Map<String, String> errors;

    public ApiErrorResponse(int status, String message) {
        this(status, message, null);
    }

    public ApiErrorResponse(int status, String message, Map<String, String> errors) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.message = message;
        this.errors = errors;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
