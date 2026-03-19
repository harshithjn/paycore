package com.upi.gateway.backend.repository;

import com.upi.gateway.backend.model.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, UUID> {
    
    List<Settlement> findByMerchantIdOrderByCreatedAtDesc(Long merchantId);
    
    List<Settlement> findByStatusOrderByCreatedAtDesc(Settlement.SettlementStatus status);
    
    Optional<Settlement> findByReferenceNumber(String referenceNumber);
    
    @Query("SELECT s FROM Settlement s WHERE s.merchantId = :merchantId AND s.periodStart >= :startDate AND s.periodEnd <= :endDate")
    List<Settlement> findByMerchantIdAndPeriod(
            @Param("merchantId") Long merchantId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    
    boolean existsByMerchantIdAndPeriodStartAndPeriodEnd(Long merchantId, LocalDateTime periodStart, LocalDateTime periodEnd);
}
