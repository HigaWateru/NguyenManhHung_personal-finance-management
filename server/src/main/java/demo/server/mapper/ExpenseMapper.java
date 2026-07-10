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
        return new ExpenseResponse(
                expense.getId(),
                expense.getCategory().getId(),
                expense.getCategory().getName(),
                expense.getAmount(),
                expense.getTransactionDate(),
                expense.getNote(),
                expense.getCreatedAt(),
                expense.getUpdatedAt()
        );
    }
}