package net.javaguides.springboot.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.javaguides.springboot.dto.DashboardStatsDto;
import net.javaguides.springboot.dto.DepartmentSummaryDto;
import net.javaguides.springboot.service.DashboardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Dashboard", description = "Aggregate HR statistics, computed live from the database")
@RestController
@RequestMapping("/api/v1/dashboard")
@PreAuthorize("hasAnyRole('ADMIN','HR')")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(summary = "Overall employee statistics")
    @GetMapping("/stats")
    public DashboardStatsDto getStats() {
        return dashboardService.getStats();
    }

    @Operation(summary = "Employee count grouped by department")
    @GetMapping("/department-summary")
    public List<DepartmentSummaryDto> getDepartmentSummary() {
        return dashboardService.getDepartmentSummary();
    }
}
