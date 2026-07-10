package demo.server.service.impl;

import demo.server.common.enums.CategoryType;
import demo.server.dto.request.IncomeRequest;
import demo.server.dto.response.IncomeResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.dto.response.PageResponse;
import demo.server.entity.Category;
import demo.server.entity.Income;
import demo.server.entity.User;
import demo.server.exception.ApiException;
import demo.server.mapper.IncomeMapper;
import demo.server.repository.CategoryRepository;
import demo.server.repository.IncomeRepository;
import demo.server.repository.UserRepository;
import demo.server.service.IncomeService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final IncomeMapper incomeMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<IncomeResponse> getIncomes(
            Long userId,
            Long categoryId,
            LocalDate fromDate,
            LocalDate toDate,
            String keyword,
            int page,
            int size
    ) {
        validateDateRange(fromDate, toDate);

        Page<IncomeResponse> incomes = incomeRepository.search(
                        userId,
                        categoryId,
                        fromDate,
                        toDate,
                        normalizeKeyword(keyword),
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionDate", "createdAt"))
                )
                .map(incomeMapper::toResponse);

        return PageResponse.from(incomes);
    }

    @Override
    @Transactional(readOnly = true)
    public IncomeResponse getIncome(Long userId, Long incomeId) {
        return incomeMapper.toResponse(findOwnedIncome(userId, incomeId));
    }

    @Override
    @Transactional
    public IncomeResponse createIncome(Long userId, IncomeRequest request) {
        User user = findActiveUser(userId);
        Category category = findCategory(userId, request.categoryId(), CategoryType.INCOME);

        Income income = incomeMapper.toEntity(
                user,
                category,
                request.amount(),
                request.transactionDate(),
                normalizeNote(request.note())
        );

        return incomeMapper.toResponse(incomeRepository.save(income));
    }

    @Override
    @Transactional
    public IncomeResponse updateIncome(Long userId, Long incomeId, IncomeRequest request) {
        Income income = findOwnedIncome(userId, incomeId);
        Category category = findCategory(userId, request.categoryId(), CategoryType.INCOME);

        income.updateDetails(
                category,
                request.amount(),
                request.transactionDate(),
                normalizeNote(request.note())
        );

        return incomeMapper.toResponse(income);
    }

    @Override
    @Transactional
    public MessageResponse deleteIncome(Long userId, Long incomeId) {
        Income income = findOwnedIncome(userId, incomeId);
        incomeRepository.delete(income);
        return new MessageResponse("Income deleted successfully");
    }

    private Income findOwnedIncome(Long userId, Long incomeId) {
        return incomeRepository.findByIdAndUserId(incomeId, userId)
                .orElseThrow(() -> ApiException.notFound("Income not found"));
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

    private void validateDateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw ApiException.badRequest("From date must be before or equal to to date");
        }
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return null;
        }

        String normalizedKeyword = keyword.trim();
        return normalizedKeyword.isEmpty() ? null : normalizedKeyword;
    }

    private String normalizeNote(String note) {
        if (note == null) {
            return null;
        }

        String normalizedNote = note.trim();
        return normalizedNote.isEmpty() ? null : normalizedNote;
    }
}