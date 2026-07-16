package demo.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaidExchangeRequest {
    @NotBlank
    private String publicToken;
    
    @NotBlank
    private String institutionName;
}
