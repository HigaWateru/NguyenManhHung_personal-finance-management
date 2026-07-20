package demo.server.mapper;

import demo.server.dto.response.ExpenseResponse;
import demo.server.entity.Category;
import demo.server.entity.Expense;
import demo.server.entity.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper {
    public Expense toEntity(User user, Category category, BigDecimal amount, LocalDate transactionDate, String note) {
        return Expense.builder()
            .user(user)
            .category(category)
            .amount(amount)
            .transactionDate(transactionDate)
            .note(note)
            .build();
    }

    public ExpenseResponse toResponse(Expense expense) {
        return ExpenseResponse.builder()
            .id(expense.getId())
            .categoryId(expense.getCategory().getId())
            .categoryName(expense.getCategory().getName())
            .amount(expense.getAmount())
            .transactionDate(expense.getTransactionDate())
            .note(expense.getNote())
            .createdAt(expense.getCreatedAt())
            .updatedAt(expense.getUpdatedAt())
            .build();
    }
}