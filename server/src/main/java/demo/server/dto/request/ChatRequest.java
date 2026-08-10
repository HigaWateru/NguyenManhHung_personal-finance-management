package demo.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRequest {
    @NotBlank(message = "Message must not be empty")
    private String message;

    private List<ChatMessage> history;

    @Getter
    @Setter
    public static class ChatMessage {
        private String role; // "user" or "model"
        private String text; // the content text
    }
}
