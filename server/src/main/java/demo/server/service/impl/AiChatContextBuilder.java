package demo.server.service.impl;

import demo.server.entity.Budget;
import demo.server.entity.Category;
import demo.server.entity.Expense;
import demo.server.entity.Goal;
import demo.server.entity.Income;
import demo.server.entity.User;
import demo.server.repository.CategoryRepository;
import demo.server.repository.ExpenseRepository;
import demo.server.repository.IncomeRepository;
import demo.server.repository.UserRepository;
import demo.server.service.BudgetService;
import demo.server.service.GoalService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AiChatContextBuilder {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetService budgetService;
    private final GoalService goalService;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    @Transactional(readOnly = true)
    public String buildSystemInstruction(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        List<Category> categories = categoryRepository.findByUserIdOrderByNameAsc(userId);
        List<Budget> budgets = budgetService.getBudgets(userId);
        List<Goal> goals = goalService.getGoals(userId);
        
        PageRequest expensePage = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "transactionDate", "createdAt"));
        List<Expense> recentExpenses = expenseRepository.findByUserId(userId, expensePage).getContent();
        
        PageRequest incomePage = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "transactionDate", "createdAt"));
        List<Income> recentIncomes = incomeRepository.findByUserId(userId, incomePage).getContent();

        StringBuilder sb = new StringBuilder();
        sb.append("You are 'Cyber Vault AI', a professional personal finance assistant. ")
          .append("You help user manage their personal finances inside the 'Cyber Vault' application. ")
          .append("Provide smart, actionable, and analytical feedback based on the user's database snapshot below. ")
          .append("Always reply in the user's language (primarily Vietnamese or English, match the language of their message). ")
          .append("Keep your responses format clean, readable (use Markdown if appropriate), and concise.\n\n");

        sb.append("USER INFO:\n")
          .append("- Name: ").append(user.getFullName()).append("\n")
          .append("- Email: ").append(user.getEmail()).append("\n")
          .append("- Preferred Currency: ").append(user.getCurrencyCode()).append("\n")
          .append("- Current Local Time: ").append(LocalDate.now()).append("\n\n");

        sb.append("CATEGORIES:\n");
        for (Category cat : categories) {
            sb.append("- ID: ").append(cat.getId()).append(", Name: ").append(cat.getName())
              .append(", Type: ").append(cat.getType()).append("\n");
        }
        sb.append("\n");

        sb.append("BUDGET LIMITS:\n");
        if (budgets.isEmpty()) {
            sb.append("(No budgets set up yet)\n");
        } else {
            for (Budget b : budgets) {
                BigDecimal spent = budgetService.getBudgetSpent(user.getId(), b.getCategory().getId());
                sb.append("- Category: ").append(b.getCategory().getName())
                  .append(", Limit: ").append(b.getLimitAmount()).append(" ").append(user.getCurrencyCode())
                  .append(", Spent: ").append(spent).append(" ").append(user.getCurrencyCode())
                  .append(" (From ").append(b.getStartDate()).append(" to ").append(b.getEndDate()).append(")\n");
            }
        }
        sb.append("\n");

        sb.append("SAVINGS GOALS:\n");
        if (goals.isEmpty()) {
            sb.append("(No savings goals set up yet)\n");
        } else {
            for (Goal g : goals) {
                sb.append("- Goal Name: ").append(g.getName())
                  .append(", Target: ").append(g.getTargetAmount()).append(" ").append(user.getCurrencyCode())
                  .append(", Current Saved: ").append(g.getCurrentAmount()).append(" ").append(user.getCurrencyCode())
                  .append(", Target Date: ").append(g.getTargetDate())
                  .append(", Status: ").append(g.getStatus()).append("\n");
            }
        }
        sb.append("\n");

        sb.append("RECENT MANUAL EXPENSES (Last 10):\n");
        if (recentExpenses.isEmpty()) {
            sb.append("(No expenses recorded)\n");
        } else {
            for (Expense e : recentExpenses) {
                sb.append("- Date: ").append(e.getTransactionDate())
                  .append(", Category: ").append(e.getCategory() != null ? e.getCategory().getName() : "N/A")
                  .append(", Amount: -").append(e.getAmount()).append(" ").append(user.getCurrencyCode())
                  .append(", Note: ").append(e.getNote() != null ? e.getNote() : "").append("\n");
            }
        }
        sb.append("\n");

        sb.append("RECENT MANUAL INCOMES (Last 10):\n");
        if (recentIncomes.isEmpty()) {
            sb.append("(No incomes recorded)\n");
        } else {
            for (Income inc : recentIncomes) {
                sb.append("- Date: ").append(inc.getTransactionDate())
                  .append(", Category: ").append(inc.getCategory() != null ? inc.getCategory().getName() : "N/A")
                  .append(", Amount: +").append(inc.getAmount()).append(" ").append(user.getCurrencyCode())
                  .append(", Note: ").append(inc.getNote() != null ? inc.getNote() : "").append("\n");
            }
        }

        return sb.toString();
    }
}
