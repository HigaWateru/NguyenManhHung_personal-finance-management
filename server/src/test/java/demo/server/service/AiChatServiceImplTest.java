package demo.server.service;

import demo.server.dto.request.ChatRequest;
import demo.server.service.impl.AiChatContextBuilder;
import demo.server.service.impl.AiChatServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Flux;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AiChatServiceImplTest {

    @Mock
    private AiChatContextBuilder aiChatContextBuilder;

    @Mock
    private OpenAiChatModel chatModel;

    @InjectMocks
    private AiChatServiceImpl aiChatService;

    @Test
    void chat_withValidKey_returnsFluxOfChunks() {
        // Set API key value via Reflection
        ReflectionTestUtils.setField(aiChatService, "geminiApiKey", "test-api-key");

        when(aiChatContextBuilder.buildSystemInstruction(eq(1L))).thenReturn("System Context");

        ChatRequest request = new ChatRequest();
        request.setMessage("hello");
        request.setHistory(Collections.emptyList());

        // Mock ChatResponse and Generations
        ChatResponse mockResponse1 = mock(ChatResponse.class);
        Generation mockGeneration1 = mock(Generation.class);
        AssistantMessage assistantMessage1 = new AssistantMessage("Hello");
        when(mockGeneration1.getOutput()).thenReturn(assistantMessage1);
        when(mockResponse1.getResult()).thenReturn(mockGeneration1);

        ChatResponse mockResponse2 = mock(ChatResponse.class);
        Generation mockGeneration2 = mock(Generation.class);
        AssistantMessage assistantMessage2 = new AssistantMessage(" World");
        when(mockGeneration2.getOutput()).thenReturn(assistantMessage2);
        when(mockResponse2.getResult()).thenReturn(mockGeneration2);

        when(chatModel.stream(any(Prompt.class))).thenReturn(Flux.just(mockResponse1, mockResponse2));

        Flux<String> result = aiChatService.chat(1L, request);

        assertNotNull(result);
        List<String> list = result.collectList().block();
        assertNotNull(list);
        assertEquals(2, list.size());
        assertEquals("Hello", list.get(0));
        assertEquals(" World", list.get(1));
    }

    @Test
    void chat_withMissingKey_returnsWarningMessage() {
        // Empty API key
        ReflectionTestUtils.setField(aiChatService, "geminiApiKey", "");

        ChatRequest request = new ChatRequest();
        request.setMessage("hello");

        Flux<String> result = aiChatService.chat(1L, request);

        assertNotNull(result);
        List<String> list = result.collectList().block();
        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(true, list.get(0).contains("Chức năng Chatbot AI chưa được cấu hình khóa API"));
    }
}
