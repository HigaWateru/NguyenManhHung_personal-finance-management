package demo.server.mapper;

import demo.server.dto.response.IncomeResponse;
import demo.server.entity.Category;
import demo.server.entity.Income;
import demo.server.entity.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.stereotype.Component;

@Component
public class IncomeMapper {

    public Income toEntity(User user, Category category, BigDecimal amount, LocalDate transactionDate, String note) {
        return Income.builder()
            .user(user)
            .category(category)
            .amount(amount)
            .transactionDate(transactionDate)
            .note(note)
            .build();
    }

    public IncomeResponse toResponse(Income income) {
        return IncomeResponse.builder()
            .id(income.getId())
            .categoryId(income.getCategory().getId())
            .categoryName(income.getCategory().getName())
            .amount(income.getAmount())
            .transactionDate(income.getTransactionDate())
            .note(income.getNote())
            .createdAt(income.getCreatedAt())
            .updatedAt(income.getUpdatedAt())
            .build();
    }
}