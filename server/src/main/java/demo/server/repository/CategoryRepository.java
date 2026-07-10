package demo.server.repository;

import demo.server.common.enums.CategoryType;
import demo.server.entity.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdOrderByNameAsc(Long userId);

    List<Category> findByUserIdAndTypeOrderByNameAsc(Long userId, CategoryType type);

    Optional<Category> findByIdAndUserId(Long id, Long userId);

    Optional<Category> findByUserIdAndNameAndType(Long userId, String name, CategoryType type);

    boolean existsByUserIdAndNameAndType(Long userId, String name, CategoryType type);

    boolean existsByUserIdAndNameIgnoreCaseAndType(Long userId, String name, CategoryType type);

    boolean existsByUserIdAndNameIgnoreCaseAndTypeAndIdNot(Long userId, String name, CategoryType type, Long id);
}