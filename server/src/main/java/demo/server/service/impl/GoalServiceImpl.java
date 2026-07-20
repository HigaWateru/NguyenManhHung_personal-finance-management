package demo.server.service.impl;

import demo.server.common.enums.CurrencyCode;
import demo.server.entity.Goal;
import demo.server.entity.User;
import demo.server.repository.GoalRepository;
import demo.server.repository.UserRepository;
import demo.server.service.ExchangeRateService;
import demo.server.service.GoalService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final ExchangeRateService exchangeRateService;


    @Override
    @Transactional(readOnly = true)
    public List<Goal> getGoals(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public Goal createGoal(Long userId, String name, BigDecimal targetAmount, LocalDate targetDate) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        BigDecimal targetInBase = exchangeRateService.convert(targetAmount, user.getDisplayCurrency(), user.getCurrencyCode());

        Goal goal = Goal.builder()
            .user(user)
            .name(name)
            .targetAmount(targetInBase)
            .currentAmount(BigDecimal.ZERO)
            .targetDate(targetDate)
            .status("ACTIVE")
            .build();

        return goalRepository.save(goal);
    }

    @Override
    @Transactional
    public Goal updateGoalProgress(Long userId, Long goalId, BigDecimal currentAmount) {
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new IllegalArgumentException("Goal not found: " + goalId));

        if (!goal.getUser().getId().equals(userId)) throw new IllegalArgumentException("Unauthorized goal access");

        User user = goal.getUser();
        BigDecimal currentInBase = exchangeRateService.convert(currentAmount, user.getDisplayCurrency(), user.getCurrencyCode());

        goal.updateProgress(currentInBase);
        
        // Auto-complete status if target reached
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.updateDetails(goal.getName(), goal.getTargetAmount(), goal.getTargetDate(), "COMPLETED");
        } else goal.updateDetails(goal.getName(), goal.getTargetAmount(), goal.getTargetDate(), "ACTIVE");

        return goalRepository.save(goal);
    }

    @Override
    @Transactional
    public Goal updateGoalDetails(Long userId, Long goalId, String name, BigDecimal targetAmount, LocalDate targetDate, String status) {
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new IllegalArgumentException("Goal not found: " + goalId));

        if (!goal.getUser().getId().equals(userId)) throw new IllegalArgumentException("Unauthorized goal access");

        User user = goal.getUser();
        BigDecimal targetInBase = exchangeRateService.convert(targetAmount, user.getDisplayCurrency(), user.getCurrencyCode());

        goal.updateDetails(name, targetInBase, targetDate, status);
        return goalRepository.save(goal);
    }


    @Override
    @Transactional
    public void deleteGoal(Long userId, Long goalId) {
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new IllegalArgumentException("Goal not found: " + goalId));

        if (!goal.getUser().getId().equals(userId)) throw new IllegalArgumentException("Unauthorized goal access");

        goalRepository.delete(goal);
    }
}