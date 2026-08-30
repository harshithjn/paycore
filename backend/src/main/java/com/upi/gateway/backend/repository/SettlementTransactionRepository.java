package com.upi.gateway.backend.repository;

import com.upi.gateway.backend.model.SettlementTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SettlementTransactionRepository extends JpaRepository<SettlementTransaction, UUID> {

    List<SettlementTransaction> findBySettlementId(UUID settlementId);

    boolean existsByTransactionId(UUID transactionId);
}
