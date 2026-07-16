package demo.server.controller;

import demo.server.dto.request.PlaidExchangeRequest;
import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.BankAccountResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.PlaidService;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/plaid")
@RequiredArgsConstructor
public class PlaidController {
    private final PlaidService plaidService;

    @PostMapping("/create-link-token")
    public ResponseEntity<ApiResponse<Map<String, String>>> createLinkToken(
        @AuthenticationPrincipal CurrentUserPrincipal principal
    ) {
        String linkToken = plaidService.createLinkToken(principal.getId());
        Map<String, String> result = new HashMap<>();
        result.put("linkToken", linkToken);
        return ResponseEntity.ok(ApiResponse.success("Link token created successfully", result));
    }

    @PostMapping("/exchange-public-token")
    public ResponseEntity<ApiResponse<MessageResponse>> exchangePublicToken(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @Valid @RequestBody PlaidExchangeRequest request
    ) {
        plaidService.exchangePublicToken(principal.getId(), request.getPublicToken(), request.getInstitutionName());
        return ResponseEntity.ok(ApiResponse.success("Public token exchanged and bank accounts connected successfully", MessageResponse.builder().message("SUCCESS").build()));
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> syncTransactions(
        @AuthenticationPrincipal CurrentUserPrincipal principal
    ) {
        int count = plaidService.syncTransactions(principal.getId());
        Map<String, Integer> result = new HashMap<>();
        result.put("syncedCount", count);
        return ResponseEntity.ok(ApiResponse.success(count + " transactions synchronized successfully.", result));
    }

    @GetMapping("/accounts")
    public ResponseEntity<ApiResponse<List<BankAccountResponse>>> getBankAccounts(
        @AuthenticationPrincipal CurrentUserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success("Bank accounts fetched successfully", plaidService.getBankAccounts(principal.getId())));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getStatus(
        @AuthenticationPrincipal CurrentUserPrincipal principal
    ) {
        boolean connected = plaidService.isBankConnected(principal.getId());
        Map<String, Boolean> result = new HashMap<>();
        result.put("connected", connected);
        return ResponseEntity.ok(ApiResponse.success("Connection status checked", result));
    }

    @PostMapping("/disconnect")
    public ResponseEntity<ApiResponse<MessageResponse>> disconnect(
        @AuthenticationPrincipal CurrentUserPrincipal principal
    ) {
        plaidService.disconnect(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Bank connection disconnected successfully", MessageResponse.builder().message("SUCCESS").build()));
    }
}
