package demo.server.controller;

import demo.server.dto.request.ChatRequest;
import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.ChatResponse;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.AiChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v2/chat", "/api/v1/chat"})
@RequiredArgsConstructor
public class AiChatController {
    private final AiChatService aiChatService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @Valid @RequestBody ChatRequest request
    ) {
        String responseText = aiChatService.chat(principal.getId(), request);
        ChatResponse chatResponse = ChatResponse.builder().response(responseText).build();
        return ResponseEntity.ok(ApiResponse.success("AI response generated", chatResponse));
    }
}
