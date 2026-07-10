package demo.server.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private final boolean success;
    private final String message;
    private final T data;
    private final Map<String, Object> errors;
    private final Instant timestamp;
    private final String path;

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .message(message)
            .data(data)
            .timestamp(Instant.now())
            .build();
    }

    public static ApiResponse<Void> failure(String message, Map<String, Object> errors, String path) {
        return ApiResponse.<Void>builder()
            .success(false)
            .message(message)
            .errors(errors)
            .timestamp(Instant.now())
            .path(path)
            .build();
    }
}