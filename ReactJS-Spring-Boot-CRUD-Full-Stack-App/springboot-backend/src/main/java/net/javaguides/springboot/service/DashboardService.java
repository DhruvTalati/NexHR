package net.javaguides.springboot.service;

import java.util.List;

import net.javaguides.springboot.dto.DashboardStatsDto;
import net.javaguides.springboot.dto.DepartmentSummaryDto;

public interface DashboardService {

    DashboardStatsDto getStats();

    List<DepartmentSummaryDto> getDepartmentSummary();
}
