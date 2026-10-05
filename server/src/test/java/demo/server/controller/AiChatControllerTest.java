package demo.server.controller;

import demo.server.dto.request.ChatRequest;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.AiChatService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AiChatControllerTest {

    @Mock
    private AiChatService aiChatService;

    @InjectMocks
    private AiChatController aiChatController;

    @Test
    void chat_shouldReturnFluxStream() {
        CurrentUserPrincipal principal = CurrentUserPrincipal.builder()
            .id(1L)
            .email("user@example.com")
            .fullName("Test User")
            .active(true)
            .build();
        ChatRequest request = new ChatRequest();
        request.setMessage("hello");
        request.setHistory(Collections.emptyList());

        Flux<String> expectedStream = Flux.just("Hello", " there", "!");
        when(aiChatService.chat(eq(1L), any(ChatRequest.class))).thenReturn(expectedStream);

        Flux<String> resultStream = aiChatController.chat(principal, request);

        assertNotNull(resultStream);
        List<String> list = resultStream.collectList().block();
        assertNotNull(list);
        assertEquals(3, list.size());
        assertEquals("Hello", list.get(0));
        assertEquals(" there", list.get(1));
        assertEquals("!", list.get(2));
    }
}
