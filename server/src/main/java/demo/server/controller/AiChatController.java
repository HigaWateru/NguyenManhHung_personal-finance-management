package demo.server.controller;

import demo.server.dto.request.ChatRequest;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.AiChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping({"/api/v2/chat", "/api/v1/chat"})
@RequiredArgsConstructor
public class AiChatController {
    private final AiChatService aiChatService;

    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @Valid @RequestBody ChatRequest request
    ) {
        return aiChatService.chat(principal.getId(), request);
    }
}
