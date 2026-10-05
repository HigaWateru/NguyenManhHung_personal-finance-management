package demo.server.service;

import demo.server.dto.request.ChatRequest;
import reactor.core.publisher.Flux;

public interface AiChatService {
    Flux<String> chat(Long userId, ChatRequest request);
}
