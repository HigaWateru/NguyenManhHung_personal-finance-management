package demo.server.repository;

import demo.server.entity.Expense;
import demo.server.repository.projection.CategoryAmountProjection;
import demo.server.repository.projection.MonthlyAmountProjection;
import demo.server.repository.projection.YearlyAmountProjection;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    Page<Expense> findByUserId(Long userId, Pageable pageable);
    List<Expense> findAllByUserId(Long userId);
    List<Expense> findByUserIdAndTransactionDateBetween(Long userId, LocalDate fromDate, LocalDate toDate);
    Page<Expense> findByUserIdAndCategoryId(Long userId, Long categoryId, Pageable pageable);
    Optional<Expense> findByIdAndUserId(Long id, Long userId);
    List<Expense> findTop5ByUserIdOrderByTransactionDateDescCreatedAtDesc(Long userId);

    @Query("select coalesce(sum(e.amount), 0) from Expense e where e.user.id = :userId")
    BigDecimal sumAmountByUserId(@Param("userId") Long userId);

    @Query("""
        select coalesce(sum(e.amount), 0) from Expense e
        where e.user.id = :userId
            and e.transactionDate between :fromDate and :toDate
        """)
    BigDecimal sumAmountByUserIdAndTransactionDateBetween(
        @Param("userId") Long userId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );

    @Query("""
        select coalesce(sum(e.amount), 0) from Expense e
        where e.user.id = :userId
            and e.category.id = :categoryId
            and e.transactionDate between :fromDate and :toDate
        """)
    BigDecimal sumAmountByUserIdAndCategoryIdAndTransactionDateBetween(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );

    @Query("""
        select month(e.transactionDate) as month, coalesce(sum(e.amount), 0) as totalAmount
        from Expense e
        where e.user.id = :userId
            and e.transactionDate between :fromDate and :toDate
        group by month(e.transactionDate)
        order by month(e.transactionDate)
        """)
    List<MonthlyAmountProjection> sumAmountGroupByMonth(
        @Param("userId") Long userId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );

    @Query("""
        select year(e.transactionDate) as year, coalesce(sum(e.amount), 0) as totalAmount
        from Expense e
        where e.user.id = :userId
        group by year(e.transactionDate)
        order by year(e.transactionDate)
        """)
    List<YearlyAmountProjection> sumAmountGroupByYear(@Param("userId") Long userId);

    @Query("""
        select e.category.id as categoryId, e.category.name as categoryName, coalesce(sum(e.amount), 0) as totalAmount
        from Expense e
        where e.user.id = :userId
            and e.transactionDate between :fromDate and :toDate
        group by e.category.id, e.category.name
        """)
    List<CategoryAmountProjection> sumAmountGroupByCategory(
        @Param("userId") Long userId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );

    @Query("""
        select e from Expense e
        where e.user.id = :userId
            and (:categoryId is null or e.category.id = :categoryId)
            and (:fromDate is null or e.transactionDate >= :fromDate)
            and (:toDate is null or e.transactionDate <= :toDate)
            and (:keyword is null or lower(coalesce(e.note, '')) like lower(concat('%', :keyword, '%')) or lower(e.category.name) like lower(concat('%', :keyword, '%')))
        """)
    Page<Expense> search(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("keyword") String keyword,
        Pageable pageable
    );
}