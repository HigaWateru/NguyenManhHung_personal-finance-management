package demo.server.service;

import demo.server.dto.request.ExpenseRequest;
import demo.server.dto.response.ExpenseResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.dto.response.PageResponse;
import java.time.LocalDate;

public interface ExpenseService {

    PageResponse<ExpenseResponse> getExpenses(
            Long userId,
            Long categoryId,
            LocalDate fromDate,
            LocalDate toDate,
            String keyword,
            int page,
            int size
    );

    ExpenseResponse getExpense(Long userId, Long expenseId);

    ExpenseResponse createExpense(Long userId, ExpenseRequest request);

    ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request);

    MessageResponse deleteExpense(Long userId, Long expenseId);
}