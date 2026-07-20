package demo.server.repository;

import demo.server.entity.BankAccount;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    List<BankAccount> findByUserId(Long userId);
    Optional<BankAccount> findByPlaidAccountId(String plaidAccountId);
    Optional<BankAccount> findByUserIdAndPlaidAccountId(Long userId, String plaidAccountId);
    void deleteByUserId(Long userId);
}