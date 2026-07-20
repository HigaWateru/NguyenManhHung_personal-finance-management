package demo.server.repository;

import demo.server.entity.Income;
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

public interface IncomeRepository extends JpaRepository<Income, Long> {
    Page<Income> findByUserId(Long userId, Pageable pageable);
    List<Income> findAllByUserId(Long userId);
    Page<Income> findByUserIdAndCategoryId(Long userId, Long categoryId, Pageable pageable);
    Optional<Income> findByIdAndUserId(Long id, Long userId);
    List<Income> findTop5ByUserIdOrderByTransactionDateDescCreatedAtDesc(Long userId);

    @Query("select coalesce(sum(i.amount), 0) from Income i where i.user.id = :userId")
    BigDecimal sumAmountByUserId(@Param("userId") Long userId);

    @Query("""
        select coalesce(sum(i.amount), 0) from Income i
        where i.user.id = :userId
            and i.transactionDate between :fromDate and :toDate
        """)
    BigDecimal sumAmountByUserIdAndTransactionDateBetween(
        @Param("userId") Long userId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );

    @Query("""
        select month(i.transactionDate) as month, coalesce(sum(i.amount), 0) as totalAmount
        from Income i
        where i.user.id = :userId
            and i.transactionDate between :fromDate and :toDate
        group by month(i.transactionDate)
        order by month(i.transactionDate)
        """)
    List<MonthlyAmountProjection> sumAmountGroupByMonth(
        @Param("userId") Long userId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );

    @Query("""
        select year(i.transactionDate) as year, coalesce(sum(i.amount), 0) as totalAmount
        from Income i
        where i.user.id = :userId
        group by year(i.transactionDate)
        order by year(i.transactionDate)
        """)
    List<YearlyAmountProjection> sumAmountGroupByYear(@Param("userId") Long userId);

    @Query("""
        select i.category.id as categoryId, i.category.name as categoryName, coalesce(sum(i.amount), 0) as totalAmount
        from Income i
        where i.user.id = :userId
            and i.transactionDate between :fromDate and :toDate
        group by i.category.id, i.category.name
        """)
    List<CategoryAmountProjection> sumAmountGroupByCategory(
        @Param("userId") Long userId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );

    @Query("""
        select i from Income i
        where i.user.id = :userId
            and (:categoryId is null or i.category.id = :categoryId)
            and (:fromDate is null or i.transactionDate >= :fromDate)
            and (:toDate is null or i.transactionDate <= :toDate)
            and (:keyword is null or lower(coalesce(i.note, '')) like lower(concat('%', :keyword, '%')) or lower(i.category.name) like lower(concat('%', :keyword, '%')))
        """)
    Page<Income> search(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("keyword") String keyword,
        Pageable pageable
    );
}