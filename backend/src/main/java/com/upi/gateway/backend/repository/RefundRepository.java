package com.upi.gateway.backend.repository;

import com.upi.gateway.backend.model.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface RefundRepository extends JpaRepository<Refund, UUID> {

    List<Refund> findByTransactionIdOrderByCreatedAtDesc(UUID transactionId);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Refund r WHERE r.transactionId = :transactionId AND r.status = 'COMPLETED'")
    BigDecimal getTotalRefundedAmount(@Param("transactionId") UUID transactionId);

    List<Refund> findByStatusOrderByCreatedAtDesc(Refund.RefundStatus status);
}
