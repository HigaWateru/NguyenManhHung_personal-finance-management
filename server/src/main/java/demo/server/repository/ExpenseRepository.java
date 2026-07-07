package demo.server.repository;

import demo.server.entity.Expense;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    Page<Expense> findByUserId(Long userId, Pageable pageable);
    Page<Expense> findByUserIdAndCategoryId(Long userId, Long categoryId, Pageable pageable);

    @Query("""
        select e from Expense e
        where e.user.id = :userId
            and (:categoryId is null or e.category.id = :categoryId)
            and (:fromDate is null or e.transactionDate >= :fromDate)
            and (:toDate is null or e.transactionDate <= :toDate)
            and (:keyword is null or lower(coalesce(e.note, '')) like lower(concat('%', :keyword, '%')))
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