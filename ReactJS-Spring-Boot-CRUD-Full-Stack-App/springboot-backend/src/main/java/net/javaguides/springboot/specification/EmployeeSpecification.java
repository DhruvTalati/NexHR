package net.javaguides.springboot.specification;

import org.springframework.data.jpa.domain.Specification;

import net.javaguides.springboot.entity.Employee;
import net.javaguides.springboot.entity.enums.Department;
import net.javaguides.springboot.entity.enums.EmployeeStatus;

/**
 * Builds dynamic WHERE clauses for Employee queries. Each method returns
 * a Specification that only adds a predicate when its argument is present,
 * so callers can combine any subset of filters with .and() without
 * writing a different repository method for every combination.
 */
public final class EmployeeSpecification {

    private EmployeeSpecification() {
    }

    public static Specification<Employee> hasDepartment(Department department) {
        return (root, query, cb) ->
                department == null
                        ? null
                        : cb.equal(root.get("department"), department);
    }

    public static Specification<Employee> hasDesignation(String designation) {
        return (root, query, cb) ->
                (designation == null || designation.isBlank())
                        ? null
                        : cb.like(
                                cb.lower(root.get("designation")),
                                "%" + designation.toLowerCase() + "%"
                        );
    }

    public static Specification<Employee> hasStatus(EmployeeStatus status) {
        return (root, query, cb) ->
                status == null
                        ? null
                        : cb.equal(root.get("status"), status);
    }

    public static Specification<Employee> nameContains(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) {
                return null;
            }

            String pattern = "%" + name.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("firstName")), pattern),
                    cb.like(cb.lower(root.get("lastName")), pattern)
            );
        };
    }

    public static Specification<Employee> emailContains(String email) {
        return (root, query, cb) ->
                (email == null || email.isBlank())
                        ? null
                        : cb.like(
                                cb.lower(root.get("email")),
                                "%" + email.toLowerCase() + "%"
                        );
    }

    /**
     * Used by the free-text /search endpoint.
     *
     * Matches the keyword against:
     * - employee code
     * - first name
     * - last name
     * - email
     */
    public static Specification<Employee> keywordMatches(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }

            String pattern = "%" + keyword.toLowerCase() + "%";

            return cb.or(
                    cb.like(
                            cb.lower(root.get("employeeCode")),
                            pattern
                    ),
                    cb.like(
                            cb.lower(root.get("firstName")),
                            pattern
                    ),
                    cb.like(
                            cb.lower(root.get("lastName")),
                            pattern
                    ),
                    cb.like(
                            cb.lower(root.get("email")),
                            pattern
                    )
            );
        };
    }
}