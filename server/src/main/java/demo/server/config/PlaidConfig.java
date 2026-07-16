package demo.server.config;

import com.plaid.client.ApiClient;
import com.plaid.client.request.PlaidApi;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PlaidConfig {
    @Value("${plaid.client-id:mock_client_id}")
    private String clientId;

    @Value("${plaid.secret:mock_secret}")
    private String secret;

    @Value("${plaid.environment:sandbox}")
    private String environment;

    @Bean
    public PlaidApi plaidApi() {
        Map<String, String> apiKeys = new HashMap<>();
        apiKeys.put("clientId", clientId);
        apiKeys.put("secret", secret);
        
        ApiClient apiClient = new ApiClient(apiKeys);
        
        if ("sandbox".equalsIgnoreCase(environment)) {
            apiClient.setPlaidAdapter("https://sandbox.plaid.com");
        } else if ("development".equalsIgnoreCase(environment)) {
            apiClient.setPlaidAdapter("https://development.plaid.com");
        } else {
            apiClient.setPlaidAdapter("https://production.plaid.com");
        }
        
        return apiClient.createService(PlaidApi.class);
    }
}
