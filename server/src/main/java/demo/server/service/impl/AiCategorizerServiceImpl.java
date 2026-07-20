package demo.server.service.impl;

import demo.server.entity.Category;
import demo.server.service.AiCategorizerService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class AiCategorizerServiceImpl implements AiCategorizerService {
    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = createRestTemplate();

    private static RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(3000);
        return new RestTemplate(factory);
    }

    @Override
    public Category categorize(String merchantName, String note, List<Category> categories) {
        if (categories == null || categories.isEmpty()) return null;

        String input = (merchantName != null ? merchantName : "") + " " + (note != null ? note : "");
        input = input.trim();

        if (input.isEmpty()) return categories.getFirst(); // fallback to first

        // Try Gemini API if key is present
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                Category apiMatched = callGeminiApi(input, categories);
                if (apiMatched != null) {
                    log.info("AI Categorizer successfully mapped '{}' to Category '{}' via Gemini API", input, apiMatched.getName());
                    return apiMatched;
                }
            } catch (Exception e) {
                log.warn("Gemini API categorization failed: {}. Falling back to NLP heuristics.", e.getMessage());
            }
        }

        // Fallback to local NLP heuristics (string similarity)
        Category heuristicsMatched = categorizeByHeuristics(input, categories);
        log.info("AI Categorizer mapped '{}' to Category '{}' via heuristics", input, heuristicsMatched.getName());
        return heuristicsMatched;
    }

    private Category callGeminiApi(String inputText, List<Category> categories) {
        StringBuilder categoryListStr = new StringBuilder();
        for (Category category : categories) {
            categoryListStr.append("- ").append(category.getName()).append(" (Type: ").append(category.getType()).append(")\n");
        }

        String prompt = String.format(
            "You are a personal finance assistant. Classify the transaction: \"%s\" into exactly one of these categories:\n%s\n" +
            "Respond ONLY with the category name. Do not include formatting, explanation, or extra characters.",
            inputText, categoryListStr.toString()
        );

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Prepare JSON request body
        Map<String, Object> parts = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(parts));
        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

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
                        String text = (String) part.get("text");
                        if (text != null) {
                            String resultName = text.trim();
                            for (Category category : categories) {
                                if (category.getName().equalsIgnoreCase(resultName) || resultName.toLowerCase().contains(category.getName().toLowerCase())) {
                                    return category;
                                }
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    private Category categorizeByHeuristics(String inputText, List<Category> categories) {
        String cleanInput = inputText.toLowerCase();

        // 1. Exact or contains match on category name
        for (Category category : categories) {
            String catName = category.getName().toLowerCase();
            if (cleanInput.contains(catName) || catName.contains(cleanInput)) return category;
        }

        // 2. Keyword mapping dictionary
        Map<String, String[]> keywordMap = new HashMap<>();
        keywordMap.put("salary", new String[]{"salary", "payroll", "paycheck", "lương", "thu nhập"});
        keywordMap.put("bonus", new String[]{"bonus", "thưởng"});
        keywordMap.put("interest", new String[]{"interest", "dividend", "yield", "lãi", "tiền lãi", "cổ tức", "tiết kiệm", "hoàn tiền", "refund"});
        keywordMap.put("food", new String[]{"starbucks", "mcdonald", "kfc", "restaurant", "pizza", "food", "dining", "uber eats", "grabfood", "cà phê", "an uong", "ăn trưa", "cafe", "sweetgreen", "royal farms", "smart & final"});
        keywordMap.put("transport", new String[]{"uber", "lyft", "grab", "taxi", "gas", "fuel", "petrol", "xăng", "xe"});
        keywordMap.put("shopping", new String[]{"amazon", "walmart", "target", "ebay", "nike", "shopee", "tiki", "lazada", "mua sắm", "quần áo", "apple", "adidas", "zara", "uniqlo"});
        keywordMap.put("entertainment", new String[]{"netflix", "spotify", "hulu", "steam", "cinema", "movie", "game", "phim", "disney", "youtube", "nintendo"});
        keywordMap.put("utilities", new String[]{"electric", "power", "water", "internet", "phone", "điện nước", "cước", "openai", "chatgpt", "software", "aws", "cloud", "google", "microsoft", "icloud"});
        keywordMap.put("health", new String[]{"pharmacy", "medical", "hospital", "doctor", "y tế", "thuốc"});

        for (Map.Entry<String, String[]> entry : keywordMap.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (cleanInput.contains(keyword)) {
                    // Find a category whose name contains or matches the key
                    for (Category category : categories) {
                        if (category.getName().toLowerCase().contains(entry.getKey()) ||
                            entry.getKey().contains(category.getName().toLowerCase())) {
                            return category;
                        }
                    }
                }
            }
        }

        // 3. Fallback: match category named "Others" or "Uncategorized" or "Khác"
        for (Category category : categories) {
            if (category.getName().equalsIgnoreCase("Others") || category.getName().equalsIgnoreCase("Uncategorized") || category.getName().equalsIgnoreCase("Khác")) {
                return category;
            }
        }

        return categories.getFirst();
    }
}