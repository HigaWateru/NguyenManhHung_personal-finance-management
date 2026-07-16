package demo.server.service;

import demo.server.dto.response.BankAccountResponse;
import java.util.List;

public interface PlaidService {
    String createLinkToken(Long userId);
    void exchangePublicToken(Long userId, String publicToken, String institutionName);
    int syncTransactions(Long userId);
    List<BankAccountResponse> getBankAccounts(Long userId);
    boolean isBankConnected(Long userId);
    void disconnect(Long userId);
}
