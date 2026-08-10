package demo.server.service;

import demo.server.dto.request.ChatRequest;

public interface AiChatService {
    String chat(Long userId, ChatRequest request);
}
