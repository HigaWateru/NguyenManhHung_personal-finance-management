package demo.server.service;

import demo.server.dto.request.IncomeRequest;
import demo.server.dto.response.IncomeResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.dto.response.PageResponse;
import java.time.LocalDate;

public interface IncomeService {
    PageResponse<IncomeResponse> getIncomes(
        Long userId,
        Long categoryId,
        LocalDate fromDate,
        LocalDate toDate,
        String keyword,
        int page,
        int size
    );

    IncomeResponse getIncome(Long userId, Long incomeId);
    IncomeResponse createIncome(Long userId, IncomeRequest request);
    IncomeResponse updateIncome(Long userId, Long incomeId, IncomeRequest request);
    MessageResponse deleteIncome(Long userId, Long incomeId);
}