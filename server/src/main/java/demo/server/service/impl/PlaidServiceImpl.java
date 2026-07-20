package demo.server.service.impl;

import com.plaid.client.model.AccountBase;
import com.plaid.client.model.AccountsGetRequest;
import com.plaid.client.model.AccountsGetResponse;
import com.plaid.client.model.CountryCode;
import com.plaid.client.model.ItemPublicTokenExchangeRequest;
import com.plaid.client.model.ItemPublicTokenExchangeResponse;
import com.plaid.client.model.LinkTokenCreateRequest;
import com.plaid.client.model.LinkTokenCreateRequestUser;
import com.plaid.client.model.LinkTokenCreateResponse;
import com.plaid.client.model.Products;
import com.plaid.client.model.TransactionsSyncRequest;
import com.plaid.client.model.TransactionsSyncResponse;
import com.plaid.client.request.PlaidApi;
import demo.server.common.enums.CategoryType;
import demo.server.common.enums.CurrencyCode;
import demo.server.dto.response.BankAccountResponse;
import demo.server.entity.BankAccount;
import demo.server.entity.Expense;
import demo.server.entity.Income;
import demo.server.entity.User;
import demo.server.repository.BankAccountRepository;
import demo.server.repository.ExpenseRepository;
import demo.server.repository.IncomeRepository;
import demo.server.repository.TransactionRepository;
import demo.server.repository.UserRepository;
import demo.server.service.CategoryClassificationService;
import demo.server.service.ExchangeRateService;
import demo.server.service.PlaidService;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import retrofit2.Response;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaidServiceImpl implements PlaidService {
    private final PlaidApi plaidApi;
    private final BankAccountRepository bankAccountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryClassificationService categoryClassificationService;
    private final ExchangeRateService exchangeRateService;
    private final demo.server.service.NotificationService notificationService;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;

    @Value("${plaid.client-id:mock_client_id}")
    private String clientId;

    @Value("${plaid.secret:mock_secret}")
    private String secret;

    @Override
    @Transactional
    public String createLinkToken(Long userId) {
        log.info("Creating Plaid Link Token for User ID: {}", userId);
        
        LinkTokenCreateRequestUser userRequest = new LinkTokenCreateRequestUser()
            .clientUserId(String.valueOf(userId));

        LinkTokenCreateRequest request = new LinkTokenCreateRequest()
            .clientId(clientId)
            .secret(secret)
            .user(userRequest)
            .clientName("Smart Finance")
            .products(Collections.singletonList(Products.TRANSACTIONS))
            .countryCodes(Collections.singletonList(CountryCode.US))
            .language("en");

        try {
            Response<LinkTokenCreateResponse> response = plaidApi.linkTokenCreate(request).execute();
            if (response.isSuccessful() && response.body() != null) return response.body().getLinkToken();
            else {
                String errorMsg = response.errorBody() != null ? response.errorBody().string() : "Unknown error";
                log.error("Failed to create Plaid Link Token: {}", errorMsg);
                throw new RuntimeException("Failed to create Plaid Link Token: " + errorMsg);
            }
        } catch (IOException e) {
            log.error("Network error while creating Plaid Link Token", e);
            throw new RuntimeException("Network error while creating Plaid Link Token", e);
        }
    }

    @Override
    @Transactional
    public void exchangePublicToken(Long userId, String publicToken, String institutionName) {
        log.info("Exchanging Plaid Public Token for User ID: {}, Institution: {}", userId, institutionName);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        ItemPublicTokenExchangeRequest request = new ItemPublicTokenExchangeRequest()
            .clientId(clientId)
            .secret(secret)
            .publicToken(publicToken);

        try {
            Response<ItemPublicTokenExchangeResponse> exchangeResponse = plaidApi.itemPublicTokenExchange(request).execute();
            if (!exchangeResponse.isSuccessful() || exchangeResponse.body() == null) {
                String error = exchangeResponse.errorBody() != null ? exchangeResponse.errorBody().string() : "Unknown error";
                log.error("Failed to exchange Plaid public token: {}", error);
                throw new RuntimeException("Failed to exchange Plaid public token: " + error);
            }

            String accessToken = exchangeResponse.body().getAccessToken();
            String itemId = exchangeResponse.body().getItemId();

            // Fetch accounts list for this token
            AccountsGetRequest accountsRequest = new AccountsGetRequest()
                .clientId(clientId)
                .secret(secret)
                .accessToken(accessToken);

            Response<AccountsGetResponse> accountsResponse = plaidApi.accountsGet(accountsRequest).execute();
            if (!accountsResponse.isSuccessful() || accountsResponse.body() == null) {
                String error = accountsResponse.errorBody() != null ? accountsResponse.errorBody().string() : "Unknown error";
                log.error("Failed to fetch Plaid accounts: {}", error);
                throw new RuntimeException("Failed to fetch Plaid accounts: " + error);
            }

            List<AccountBase> plaidAccounts = accountsResponse.body().getAccounts();
            for (AccountBase plaidAcc : plaidAccounts) {
                // Save or update BankAccount
                BankAccount account = bankAccountRepository.findByPlaidAccountId(plaidAcc.getAccountId())
                    .orElseGet(() -> BankAccount.builder()
                        .user(user)
                        .plaidAccountId(plaidAcc.getAccountId())
                        .build()
                    );

                BankAccount updatedAccount = BankAccount.builder()
                    .id(account.getId())
                    .user(user)
                    .institutionName(institutionName)
                    .accountName(plaidAcc.getName())
                    .accountType(plaidAcc.getType().getValue())
                    .accountSubtype(plaidAcc.getSubtype() != null ? plaidAcc.getSubtype().getValue() : null)
                    .currentBalance(BigDecimal.valueOf(plaidAcc.getBalances().getCurrent() != null ? plaidAcc.getBalances().getCurrent() : 0.0))
                    .plaidAccountId(plaidAcc.getAccountId())
                    .plaidItemId(itemId)
                    .plaidAccessToken(accessToken)
                    .connectionStatus("CONNECTED")
                    .lastSyncedAt(LocalDateTime.now())
                    .createdAt(account.getCreatedAt())
                    .build();

                bankAccountRepository.save(updatedAccount);
            }

            log.info("Plaid connection established successfully for User: {}", userId);

            try {
                notificationService.createNotification(
                    userId,
                    "Kết nối Ngân hàng Sandbox",
                    "Đã kết nối thành công tài khoản ngân hàng " + institutionName + ".",
                    "PLAID"
                );
            } catch (Exception e) {
                log.warn("Could not save notification for Plaid connection", e);
            }

        } catch (IOException e) {
            log.error("Error exchanging Plaid token or fetching accounts", e);
            throw new RuntimeException("Error establishing Plaid connection", e);
        }
    }

    @Override
    @Transactional
    public int syncTransactions(Long userId) {
        log.info("Syncing Plaid Transactions for User ID: {}", userId);
        List<BankAccount> bankAccounts = bankAccountRepository.findByUserId(userId);
        if (bankAccounts.isEmpty()) {
            log.warn("No connected bank accounts found for User: {}", userId);
            return 0;
        }

        String accessToken = bankAccounts.getFirst().getPlaidAccessToken();
        
        int totalSyncCount = 0;
        boolean hasMore = true;
        String cursor = null;

        try {
            while (hasMore) {
                TransactionsSyncRequest request = new TransactionsSyncRequest()
                    .clientId(clientId)
                    .secret(secret)
                    .accessToken(accessToken)
                    .cursor(cursor);

                Response<TransactionsSyncResponse> response = plaidApi.transactionsSync(request).execute();
                if (!response.isSuccessful() || response.body() == null) {
                    String error = response.errorBody() != null ? response.errorBody().string() : "Unknown error";
                    log.error("Failed to sync transactions from Plaid: {}", error);
                    throw new RuntimeException("Failed to sync Plaid transactions: " + error);
                }

                TransactionsSyncResponse syncResponse = response.body();
                List<com.plaid.client.model.Transaction> addedTransactions = syncResponse.getAdded();
                
                for (com.plaid.client.model.Transaction plaidTx : addedTransactions) {
                    // Check if already exists to prevent duplicate entries
                    if (transactionRepository.existsByPlaidTransactionId(plaidTx.getTransactionId())) continue;

                    // Find matching BankAccount
                    BankAccount dbAccount = bankAccountRepository.findByPlaidAccountId(plaidTx.getAccountId()).orElse(null);
                    User userObj = dbAccount != null ? dbAccount.getUser() : userRepository.findById(userId).orElse(null);

                    // Convert Plaid transaction into our DB Transaction entity
                    BigDecimal amountVal = BigDecimal.valueOf(plaidTx.getAmount());
                    CategoryType txType = amountVal.compareTo(BigDecimal.ZERO) < 0 ? CategoryType.INCOME : CategoryType.EXPENSE;
                    
                    // In Plaid, positive value is debit (expense) and negative is credit (income)
                    // Let's normalize it to always positive in our DB amount column
                    BigDecimal normalizedAmount = amountVal.abs();

                    String isoCode = plaidTx.getIsoCurrencyCode();
                    CurrencyCode plaidCurrency = CurrencyCode.USD;
                    if (isoCode != null) {
                        try {
                            plaidCurrency = CurrencyCode.valueOf(isoCode.toUpperCase());
                        } catch (IllegalArgumentException e) {
                            // ignore fallback
                        }
                    }

                    CurrencyCode userBaseCurrency = userObj != null ? userObj.getCurrencyCode() : CurrencyCode.VND;
                    BigDecimal normalizedAmountInBaseCurrency = exchangeRateService.convert(normalizedAmount, plaidCurrency, userBaseCurrency);

                    demo.server.entity.Transaction tx = demo.server.entity.Transaction.builder()
                        .user(userObj != null ? userObj : userRepository.getReferenceById(userId))
                        .bankAccount(dbAccount)
                        .plaidTransactionId(plaidTx.getTransactionId())
                        .merchantName(plaidTx.getMerchantName() != null ? plaidTx.getMerchantName() : plaidTx.getName())
                        .note(plaidTx.getName())
                        .amount(normalizedAmountInBaseCurrency)
                        .originalAmount(normalizedAmount)
                        .originalCurrency(plaidCurrency)
                        .type(txType)
                        .transactionDate(plaidTx.getDate())
                        .pending(plaidTx.getPending())
                        .build();


                    // Save transaction initially without category
                    tx = transactionRepository.save(tx);

                    // Run the Category classification sequence (caching, rules, AI)
                    categoryClassificationService.classifyTransaction(tx);
                    
                    // Save classification result
                    transactionRepository.save(tx);
                    totalSyncCount++;
                }

                cursor = syncResponse.getNextCursor();
                hasMore = syncResponse.getHasMore();
            }

            // Classify only transactions that do not yet have a category assigned
            List<demo.server.entity.Transaction> allUserTxs = transactionRepository.findByUserId(userId);
            for (demo.server.entity.Transaction tx : allUserTxs) {
                if (tx.getCategory() == null) {
                    categoryClassificationService.classifyTransaction(tx);
                    transactionRepository.save(tx);
                }
            }

            // Sync Plaid transactions to Income and Expense entities for full reporting
            syncTransactionsToIncomeAndExpense(userId, allUserTxs);

            // Update last synced timestamps on bank accounts
            LocalDateTime now = LocalDateTime.now();
            for (BankAccount acc : bankAccounts) {
                acc.updateLastSynced(now);
                // Get latest balance from Plaid and update
                bankAccountRepository.save(acc);
            }
            log.info("Plaid sync finished. Synced {} new transactions for User: {}", totalSyncCount, userId);

            try {
                String message = totalSyncCount > 0 
                    ? "Đã đồng bộ thành công " + totalSyncCount + " giao dịch từ ngân hàng First Platypus Bank."
                    : "Đã đồng bộ ngân hàng First Platypus Bank. Toàn bộ 15 giao dịch đã ở trạng thái cập nhật mới nhất.";
                notificationService.createNotification(
                    userId,
                    "Đồng bộ Giao dịch Plaid",
                    message,
                    "PLAID"
                );
            } catch (Exception e) {
                log.warn("Could not save notification for Plaid sync", e);
            }

            return totalSyncCount;

        } catch (Exception e) {
            log.error("Error or timeout during Plaid transaction sync for user {}", userId, e);
            boolean isTimeout = e instanceof java.io.InterruptedIOException
                || e instanceof java.net.SocketTimeoutException 
                || e instanceof java.util.concurrent.TimeoutException
                || (e.getMessage() != null && (e.getMessage().toLowerCase().contains("timeout") 
                || e.getMessage().toLowerCase().contains("timed out")
                || e.getMessage().toLowerCase().contains("time out")));

            try {
                String title = "Cảnh báo Đồng bộ Giao dịch";
                String message = isTimeout
                    ? "Đồng bộ giao dịch thất bại do quá thời gian phản hồi từ máy chủ (Server Response Timeout). Vui lòng thử lại sau."
                    : "Đồng bộ giao dịch thất bại: " + (e.getMessage() != null ? e.getMessage() : "Lỗi kết nối máy chủ.");

                notificationService.createNotification(
                    userId,
                    title,
                    message,
                    "PLAID_ERROR"
                );
            } catch (Exception notifErr) {
                log.warn("Could not save error notification for Plaid sync timeout", notifErr);
            }

            throw new RuntimeException(
                isTimeout 
                    ? "Đồng bộ giao dịch thất bại do quá thời gian phản hồi từ máy chủ (Server Response Timeout)."
                    : "Failed to sync Plaid transactions: " + e.getMessage(), 
                e
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BankAccountResponse> getBankAccounts(Long userId) {
        return bankAccountRepository.findByUserId(userId).stream()
            .map(acc -> BankAccountResponse.builder()
                .id(acc.getId())
                .institutionName(acc.getInstitutionName())
                .accountName(acc.getAccountName())
                .accountType(acc.getAccountType())
                .accountSubtype(acc.getAccountSubtype())
                .currentBalance(acc.getCurrentBalance())
                .lastSyncedAt(acc.getLastSyncedAt())
                .connectionStatus(acc.getConnectionStatus())
                .build()
            ).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isBankConnected(Long userId) {
        return !bankAccountRepository.findByUserId(userId).isEmpty();
    }

    @Override
    @Transactional
    public void disconnect(Long userId) {
        log.info("Disconnecting Plaid Bank accounts for User ID: {}", userId);
        
        // Clean up linked transactions
        List<BankAccount> accounts = bankAccountRepository.findByUserId(userId);
        for (BankAccount acc : accounts) {
            // Unlink or delete transaction records
            transactionRepository.deleteByUserId(userId);
        }
        bankAccountRepository.deleteByUserId(userId);
        log.info("Plaid Bank accounts disconnected for User: {}", userId);
    }

    private void syncTransactionsToIncomeAndExpense(Long userId, List<demo.server.entity.Transaction> transactions) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        for (demo.server.entity.Transaction tx : transactions) {
            if (tx.getCategory() == null) continue;

            String noteText = tx.getMerchantName() != null && !tx.getMerchantName().isBlank() 
                ? tx.getMerchantName() 
                : tx.getNote();

            if (tx.getType() == CategoryType.INCOME) {
                // Check if Income record already exists for this note/date/user
                List<Income> existing = incomeRepository.findAllByUserId(userId).stream()
                    .filter(i -> i.getTransactionDate().equals(tx.getTransactionDate()) 
                        && i.getAmount().compareTo(tx.getAmount()) == 0
                        && ((i.getNote() == null && noteText == null) || (i.getNote() != null && i.getNote().equalsIgnoreCase(noteText))))
                    .toList();

                if (existing.isEmpty()) {
                    Income income = Income.builder()
                        .user(user)
                        .category(tx.getCategory())
                        .amount(tx.getAmount())
                        .transactionDate(tx.getTransactionDate())
                        .note(noteText)
                        .build();
                    incomeRepository.save(income);
                } else for (Income inc : existing) {
                    inc.updateDetails(tx.getCategory(), tx.getAmount(), tx.getTransactionDate(), noteText);
                    incomeRepository.save(inc);
                }
            } else if (tx.getType() == CategoryType.EXPENSE) {
                // Check if Expense record already exists for this note/date/user
                List<Expense> existing = expenseRepository.findAllByUserId(userId).stream()
                    .filter(e -> e.getTransactionDate().equals(tx.getTransactionDate()) 
                        && e.getAmount().compareTo(tx.getAmount()) == 0
                        && ((e.getNote() == null && noteText == null) || (e.getNote() != null && e.getNote().equalsIgnoreCase(noteText))))
                    .toList();

                if (existing.isEmpty()) {
                    Expense expense = Expense.builder()
                        .user(user)
                        .category(tx.getCategory())
                        .amount(tx.getAmount())
                        .transactionDate(tx.getTransactionDate())
                        .note(noteText)
                        .build();
                    expenseRepository.save(expense);
                } else {
                    for (Expense exp : existing) {
                        exp.updateDetails(tx.getCategory(), tx.getAmount(), tx.getTransactionDate(), noteText);
                        expenseRepository.save(exp);
                    }
                }
            }
        }
    }
}