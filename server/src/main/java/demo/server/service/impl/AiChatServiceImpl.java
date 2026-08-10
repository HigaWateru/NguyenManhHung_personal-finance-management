package demo.server.service.impl;

import demo.server.dto.request.ChatRequest;
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
import demo.server.service.AiChatService;
import demo.server.service.BudgetService;
import demo.server.service.GoalService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiChatServiceImpl implements AiChatService {

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetService budgetService;
    private final GoalService goalService;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    private final RestTemplate restTemplate = createRestTemplate();

    private static RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(15000);
        return new RestTemplate(factory);
    }

    @Override
    public String chat(Long userId, ChatRequest request) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.contains("YOUR_GEMINI_API_KEY")) {
            return "Chào bạn! Chức năng Chatbot AI chưa được cấu hình khóa API (API Key). " +
                   "Vui lòng cấu hình thuộc tính `gemini.api-key` trong file `application.properties` của server để kích hoạt tính năng này.";
        }

        try {
            // Gather context
            User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
            List<Category> categories = categoryRepository.findByUserIdOrderByNameAsc(userId);
            List<Budget> budgets = budgetService.getBudgets(userId);
            List<Goal> goals = goalService.getGoals(userId);
            
            // Get recent transactions (top 10 expenses and top 10 incomes)
            PageRequest expensePage = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "transactionDate", "createdAt"));
            List<Expense> recentExpenses = expenseRepository.findByUserId(userId, expensePage).getContent();
            
            PageRequest incomePage = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "transactionDate", "createdAt"));
            List<Income> recentIncomes = incomeRepository.findByUserId(userId, incomePage).getContent();

            // Construct system instruction with user data context
            String systemInstruction = buildSystemInstruction(user, categories, budgets, goals, recentExpenses, recentIncomes);

            // Construct API request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));

            List<Map<String, Object>> contents = new ArrayList<>();
            
            // Append history
            if (request.getHistory() != null) {
                for (ChatRequest.ChatMessage historyMsg : request.getHistory()) {
                    String role = historyMsg.getRole();
                    if ("assistant".equalsIgnoreCase(role)) {
                        role = "model";
                    }
                    contents.add(Map.of(
                        "role", role.toLowerCase(),
                        "parts", List.of(Map.of("text", historyMsg.getText()))
                    ));
                }
            }

            // Append current message
            contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", request.getMessage()))
            ));
            
            requestBody.put("contents", contents);

            // Call Gemini API
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List candidates = (List) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = (Map) candidates.getFirst();
                    Map contentMap = (Map) candidate.get("content");
                    if (contentMap != null) {
                        List partsList = (List) contentMap.get("parts");
                        if (partsList != null && !partsList.isEmpty()) {
                            Map part = (Map) partsList.getFirst();
                            String responseText = (String) part.get("text");
                            if (responseText != null) {
                                return responseText.trim();
                            }
                        }
                    }
                }
            }

            return "Không thể nhận được câu trả lời từ AI. Vui lòng thử lại sau.";
        } catch (Exception e) {
            log.error("AI Chat failed: ", e);
            return "Đã xảy ra lỗi khi kết nối với dịch vụ AI: " + e.getMessage();
        }
    }

    private String buildSystemInstruction(
        User user,
        List<Category> categories,
        List<Budget> budgets,
        List<Goal> goals,
        List<Expense> expenses,
        List<Income> incomes
    ) {
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
        if (expenses.isEmpty()) {
            sb.append("(No expenses recorded)\n");
        } else {
            for (Expense e : expenses) {
                sb.append("- Date: ").append(e.getTransactionDate())
                  .append(", Category: ").append(e.getCategory().getName())
                  .append(", Amount: -").append(e.getAmount()).append(" ").append(user.getCurrencyCode())
                  .append(", Note: ").append(e.getNote() != null ? e.getNote() : "").append("\n");
            }
        }
        sb.append("\n");

        sb.append("RECENT MANUAL INCOMES (Last 10):\n");
        if (incomes.isEmpty()) {
            sb.append("(No incomes recorded)\n");
        } else {
            for (Income inc : incomes) {
                sb.append("- Date: ").append(inc.getTransactionDate())
                  .append(", Category: ").append(inc.getCategory().getName())
                  .append(", Amount: +").append(inc.getAmount()).append(" ").append(user.getCurrencyCode())
                  .append(", Note: ").append(inc.getNote() != null ? inc.getNote() : "").append("\n");
            }
        }

        return sb.toString();
    }
}
