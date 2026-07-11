package demo.server.service;

import demo.server.dto.response.DashboardResponse;

public interface DashboardService {

    DashboardResponse getDashboard(Long userId);
}