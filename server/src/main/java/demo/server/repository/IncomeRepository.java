package demo.server.repository;

import demo.server.entity.Income;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    Page<Income> findByUserId(Long userId, Pageable pageable);

    Page<Income> findByUserIdAndCategoryId(Long userId, Long categoryId, Pageable pageable);

    Optional<Income> findByIdAndUserId(Long id, Long userId);

    @Query("""
        select i from Income i
        where i.user.id = :userId
            and (:categoryId is null or i.category.id = :categoryId)
            and (:fromDate is null or i.transactionDate >= :fromDate)
            and (:toDate is null or i.transactionDate <= :toDate)
            and (:keyword is null or lower(coalesce(i.note, '')) like lower(concat('%', :keyword, '%')))
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