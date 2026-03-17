package com.upi.gateway.backend.repository;

import com.upi.gateway.backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    
    List<Transaction> findByMerchantIdOrderByCreatedAtDesc(Long merchantId);
    
    List<Transaction> findByMerchantIdAndStatusOrderByCreatedAtDesc(Long merchantId, Transaction.TransactionStatus status);
    
    @Query("SELECT t FROM Transaction t WHERE t.merchantId = :merchantId AND t.status IN :statuses ORDER BY t.createdAt DESC")
    List<Transaction> findByMerchantIdAndStatusInOrderByCreatedAtDesc(
            @Param("merchantId") Long merchantId, 
            @Param("statuses") List<Transaction.TransactionStatus> statuses);
    
    long countByMerchantIdAndStatus(Long merchantId, Transaction.TransactionStatus status);
}