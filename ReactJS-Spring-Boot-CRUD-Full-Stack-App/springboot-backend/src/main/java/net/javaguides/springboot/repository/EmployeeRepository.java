package net.javaguides.springboot.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import net.javaguides.springboot.entity.Employee;
import net.javaguides.springboot.entity.enums.EmployeeStatus;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByStatus(EmployeeStatus status);

    long countByDepartment(net.javaguides.springboot.entity.enums.Department department);


    @Query("select avg(e.salary) from Employee e")
    Double findAverageSalary();

    @Query("select count(distinct e.department) from Employee e")
    long countDistinctDepartments();

    @Query("select e.department as department, count(e) as employeeCount from Employee e group by e.department")
    List<DepartmentCountProjection> countEmployeesGroupedByDepartment();

    interface DepartmentCountProjection {
        net.javaguides.springboot.entity.enums.Department getDepartment();
        long getEmployeeCount();
    }
}
