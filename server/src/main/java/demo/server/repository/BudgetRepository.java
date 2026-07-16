package demo.server.repository;

import demo.server.entity.Budget;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);
    List<Budget> findByUserIdAndStartDateBetween(Long userId, LocalDate start, LocalDate end);
    Optional<Budget> findByUserIdAndCategoryIdAndStartDateAndEndDate(Long userId, Long categoryId, LocalDate start, LocalDate end);
}
