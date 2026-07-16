package demo.server.repository;

import demo.server.common.enums.CategoryType;
import demo.server.entity.Transaction;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    Optional<Transaction> findByPlaidTransactionId(String plaidTransactionId);
    boolean existsByPlaidTransactionId(String plaidTransactionId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    BigDecimal sumAmountByUserIdAndType(@Param("userId") Long userId, @Param("type") CategoryType type);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.transactionDate BETWEEN :start AND :end")
    BigDecimal sumAmountByUserIdAndTypeAndTransactionDateBetween(
        @Param("userId") Long userId,
        @Param("type") CategoryType type,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.category.id = :categoryId AND t.type = :type AND t.transactionDate BETWEEN :start AND :end")
    BigDecimal sumAmountByUserIdAndCategoryIdAndTypeAndTransactionDateBetween(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("type") CategoryType type,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    List<Transaction> findTop5ByUserIdOrderByTransactionDateDescCreatedAtDesc(Long userId);

    List<Transaction> findByUserIdAndTransactionDateBetween(Long userId, LocalDate start, LocalDate end);
    
    void deleteByUserId(Long userId);
}
