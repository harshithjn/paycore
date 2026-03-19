package com.upi.gateway.backend.manager;


import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.RefundRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Singleton Pattern: RefundManager
 * Centralized configuration and validation for refund operations
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RefundManager {
    
    private static RefundManager instance;
    
    private final RefundRepository refundRepository;
    
    // Configuration constants
    private static final BigDecimal MIN_REFUND_AMOUNT = new BigDecimal("1.00");
    
    @PostConstruct
    public void init() {
        instance = this;
        log.info("RefundManager singleton initialized");
    }
    
    public static RefundManager getInstance() {
        if (instance == null) {
            throw new IllegalStateException("RefundManager not initialized");
        }
        return instance;
    }
    
    /**
     * Validate refund request against business rules
     */
    public boolean validateRefund(Transaction transaction, BigDecimal amount) {
        // Rule 1: Transaction must be in SUCCESS or SETTLED state
        if (transaction.getStatus() != Transaction.TransactionStatus.SUCCESS 
                && transaction.getStatus() != Transaction.TransactionStatus.SETTLED) {
            log.warn("Cannot refund transaction in status: {}", transaction.getStatus());
            return false;
        }
        
        // Rule 2: Amount must be positive and above minimum
        if (amount.compareTo(MIN_REFUND_AMOUNT) < 0) {
            log.warn("Refund amount {} is below minimum {}", amount, MIN_REFUND_AMOUNT);
            return false;
        }
        
        // Rule 3: Amount cannot exceed transaction amount
        if (amount.compareTo(transaction.getAmount()) > 0) {
            log.warn("Refund amount {} exceeds transaction amount {}", amount, transaction.getAmount());
            return false;
        }
        
        // Rule 4: Check remaining refundable amount
        BigDecimal totalRefunded = refundRepository.getTotalRefundedAmount(transaction.getId());
        BigDecimal remainingAmount = transaction.getAmount().subtract(totalRefunded);
        
        if (amount.compareTo(remainingAmount) > 0) {
            log.warn("Refund amount {} exceeds remaining refundable amount {}", amount, remainingAmount);
            return false;
        }
        
        return true;
    }
    
    /**
     * Calculate remaining refundable amount for a transaction
     */
    public BigDecimal getRemainingRefundableAmount(Transaction transaction) {
        BigDecimal totalRefunded = refundRepository.getTotalRefundedAmount(transaction.getId());
        return transaction.getAmount().subtract(totalRefunded);
    }
    
    /**
     * Check if transaction is fully refunded
     */
    public boolean isFullyRefunded(Transaction transaction) {
        BigDecimal totalRefunded = refundRepository.getTotalRefundedAmount(transaction.getId());
        return totalRefunded.compareTo(transaction.getAmount()) >= 0;
    }
}
