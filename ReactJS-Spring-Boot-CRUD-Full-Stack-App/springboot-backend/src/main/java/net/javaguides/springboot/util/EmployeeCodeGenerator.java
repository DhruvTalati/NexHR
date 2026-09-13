package net.javaguides.springboot.util;

import java.time.Year;
import java.util.UUID;

import org.springframework.stereotype.Component;

/**
 * Generates a human-readable, unique employee code such as "EMP-2026-A1B2C3D4".
 *
 * Deliberately does NOT depend on the entity's database identity value:
 * with IDENTITY-strategy primary keys, the id is only known after the row
 * is inserted, which would otherwise force an insert-then-update just to
 * set the code. A UUID-derived suffix avoids that round trip and avoids
 * uniqueness collisions without a separate sequence table.
 */
@Component
public class EmployeeCodeGenerator {

    public String generate() {
        String suffix = UUID.randomUUID().toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
        return "EMP-" + Year.now() + "-" + suffix;
    }
}
