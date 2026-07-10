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
        return new IncomeResponse(
                income.getId(),
                income.getCategory().getId(),
                income.getCategory().getName(),
                income.getAmount(),
                income.getTransactionDate(),
                income.getNote(),
                income.getCreatedAt(),
                income.getUpdatedAt()
        );
    }
}