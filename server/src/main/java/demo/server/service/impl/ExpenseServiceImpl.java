package demo.server.service.impl;

import demo.server.common.enums.CategoryType;
import demo.server.dto.request.ExpenseRequest;
import demo.server.dto.response.ExpenseResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.dto.response.PageResponse;
import demo.server.entity.Category;
import demo.server.entity.Expense;
import demo.server.entity.User;
import demo.server.exception.ApiException;
import demo.server.mapper.ExpenseMapper;
import demo.server.repository.CategoryRepository;
import demo.server.repository.ExpenseRepository;
import demo.server.repository.UserRepository;
import demo.server.service.ExpenseService;
import demo.server.service.impl.support.ServiceInputUtils;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ExpenseMapper expenseMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExpenseResponse> getExpenses(
            Long userId,
            Long categoryId,
            LocalDate fromDate,
            LocalDate toDate,
            String keyword,
            int page,
            int size
    ) {
        ServiceInputUtils.validateDateRange(fromDate, toDate);

        Page<ExpenseResponse> expenses = expenseRepository.search(
                        userId,
                        categoryId,
                        fromDate,
                        toDate,
                        ServiceInputUtils.normalizeOptionalText(keyword),
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionDate", "createdAt"))
                )
                .map(expenseMapper::toResponse);

        return PageResponse.from(expenses);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getExpense(Long userId, Long expenseId) {
        return expenseMapper.toResponse(findOwnedExpense(userId, expenseId));
    }

    @Override
    @Transactional
    public ExpenseResponse createExpense(Long userId, ExpenseRequest request) {
        User user = findActiveUser(userId);
        Category category = findCategory(userId, request.categoryId(), CategoryType.EXPENSE);

        Expense expense = expenseMapper.toEntity(
                user,
                category,
                request.amount(),
                request.transactionDate(),
                ServiceInputUtils.normalizeOptionalText(request.note())
        );

        return expenseMapper.toResponse(expenseRepository.save(expense));
    }

    @Override
    @Transactional
    public ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request) {
        Expense expense = findOwnedExpense(userId, expenseId);
        Category category = findCategory(userId, request.categoryId(), CategoryType.EXPENSE);

        expense.updateDetails(
                category,
                request.amount(),
                request.transactionDate(),
                ServiceInputUtils.normalizeOptionalText(request.note())
        );

        return expenseMapper.toResponse(expense);
    }

    @Override
    @Transactional
    public MessageResponse deleteExpense(Long userId, Long expenseId) {
        Expense expense = findOwnedExpense(userId, expenseId);
        expenseRepository.delete(expense);
        return new MessageResponse("Expense deleted successfully");
    }

    private Expense findOwnedExpense(Long userId, Long expenseId) {
        return expenseRepository.findByIdAndUserId(expenseId, userId)
                .orElseThrow(() -> ApiException.notFound("Expense not found"));
    }

    private User findActiveUser(Long userId) {
        return userRepository.findByIdAndActiveTrue(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private Category findCategory(Long userId, Long categoryId, CategoryType expectedType) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> ApiException.notFound("Category not found"));

        if (category.getType() != expectedType) {
            throw ApiException.badRequest("Selected category type is invalid");
        }

        return category;
    }

}