package demo.server.repository;

import demo.server.entity.MerchantMapping;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MerchantMappingRepository extends JpaRepository<MerchantMapping, Long> {
    List<MerchantMapping> findByUserId(Long userId);

    @Query("SELECT m FROM MerchantMapping m WHERE m.user.id = :userId AND LOWER(m.merchantName) = LOWER(:merchantName)")
    Optional<MerchantMapping> findByUserIdAndMerchantNameIgnoreCase(
        @Param("userId") Long userId,
        @Param("merchantName") String merchantName
    );

    @Query("SELECT m FROM MerchantMapping m WHERE m.user IS NULL AND LOWER(m.merchantName) = LOWER(:merchantName)")
    Optional<MerchantMapping> findGlobalMappingIgnoreCase(@Param("merchantName") String merchantName);
}
