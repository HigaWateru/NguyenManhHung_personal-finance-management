package demo.server.service.impl;

import demo.server.dto.request.ChatRequest;
import demo.server.service.AiChatService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class AiChatServiceImpl implements AiChatService {

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @Value("${gemini.model-name:gemini-flash-lite-latest}")
    private String geminiModelName;

    private final AiChatContextBuilder aiChatContextBuilder;

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
            // Construct system instruction with user data context within a read-only transaction
            String systemInstruction = aiChatContextBuilder.buildSystemInstruction(userId);

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
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModelName + ":generateContent?key=" + geminiApiKey;

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
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("AI Chat HTTP error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
                return "Khóa API (API Key) của Gemini không hợp lệ hoặc đã hết hạn (401 Unauthorized). Vui lòng cấu hình thuộc tính `gemini.api-key` trong file `application.properties` hoặc biến môi trường `GEMINI_API_KEY` với API Key hợp lệ của bạn.";
            }
            return "Lỗi kết nối AI (HTTP " + e.getStatusCode().value() + "): " + e.getStatusText();
        } catch (Exception e) {
            log.error("AI Chat failed: ", e);
            return "Đã xảy ra lỗi khi kết nối với dịch vụ AI: " + e.getMessage();
        }
    }
}
