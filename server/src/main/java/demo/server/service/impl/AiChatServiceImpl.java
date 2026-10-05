package demo.server.service.impl;

import demo.server.dto.request.ChatRequest;
import demo.server.service.AiChatService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiChatServiceImpl implements AiChatService {

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private final AiChatContextBuilder aiChatContextBuilder;
    private final OpenAiChatModel chatModel;

    @Override
    public Flux<String> chat(Long userId, ChatRequest request) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.contains("YOUR_GEMINI_API_KEY")) {
            return Flux.just("Chào bạn! Chức năng Chatbot AI chưa được cấu hình khóa API (API Key). " +
                   "Vui lòng cấu hình thuộc tính `gemini.api-key` trong file `application.properties` của server để kích hoạt tính năng này.");
        }

        try {
            // Construct system instruction with user data context
            String systemInstruction = aiChatContextBuilder.buildSystemInstruction(userId);

            List<Message> messages = new ArrayList<>();
            messages.add(new SystemMessage(systemInstruction));

            // Append history
            if (request.getHistory() != null) {
                for (ChatRequest.ChatMessage historyMsg : request.getHistory()) {
                    String role = historyMsg.getRole();
                    if ("user".equalsIgnoreCase(role)) {
                        messages.add(new UserMessage(historyMsg.getText()));
                    } else if ("assistant".equalsIgnoreCase(role) || "model".equalsIgnoreCase(role)) {
                        messages.add(new AssistantMessage(historyMsg.getText()));
                    }
                }
            }

            // Append current message
            messages.add(new UserMessage(request.getMessage()));

            Prompt prompt = new Prompt(messages);

            // Stream response
            return chatModel.stream(prompt)
                .map(chatResponse -> {
                    if (chatResponse.getResult() != null && chatResponse.getResult().getOutput() != null) {
                        String content = chatResponse.getResult().getOutput().getText();
                        return content != null ? content : "";
                    }
                    return "";
                })
                .filter(text -> !text.isEmpty())
                .onErrorResume(e -> {
                    log.error("AI Chat streaming failed: ", e);
                    return Flux.just("Đã xảy ra lỗi khi kết nối với dịch vụ AI: " + e.getMessage());
                });
        } catch (Exception e) {
            log.error("AI Chat initialization failed: ", e);
            return Flux.just("Đã xảy ra lỗi khi kết nối với dịch vụ AI: " + e.getMessage());
        }
    }
}
