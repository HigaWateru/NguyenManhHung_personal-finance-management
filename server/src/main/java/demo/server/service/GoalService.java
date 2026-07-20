package demo.server.service;

import demo.server.entity.Goal;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface GoalService {
    List<Goal> getGoals(Long userId);
    Goal createGoal(Long userId, String name, BigDecimal targetAmount, LocalDate targetDate);
    Goal updateGoalProgress(Long userId, Long goalId, BigDecimal currentAmount);
    Goal updateGoalDetails(Long userId, Long goalId, String name, BigDecimal targetAmount, LocalDate targetDate, String status);
    void deleteGoal(Long userId, Long goalId);
}