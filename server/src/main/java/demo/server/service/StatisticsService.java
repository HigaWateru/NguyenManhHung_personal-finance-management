package demo.server.service;

import demo.server.dto.response.StatisticsResponse;

public interface StatisticsService {
    StatisticsResponse getStatistics(Long userId, Integer year);
}