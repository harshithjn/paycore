package com.upi.gateway.backend.manager;

import com.upi.gateway.backend.model.Transaction;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Singleton Pattern: SettlementEngine
 * Centralized settlement computation and business logic
 */
@Component
@Slf4j
public class SettlementEngine {
    
    private static SettlementEngine instance;
    
    // Configuration constants
    private static final BigDecimal MIN_SETTLEMENT_AMOUNT = new BigDecimal("10.00");
    private static final BigDecimal PLATFORM_FEE_PERCENTAGE = new BigDecimal("0.02"); // 2%
    
    @PostConstruct
    public void init() {
        instance = this;
        log.info("SettlementEngine singleton initialized");
    }
    
    public static SettlementEngine getInstance() {
        if (instance == null) {
            throw new IllegalStateException("SettlementEngine not initialized");
        }
        return instance;
    }
    
    /**
     * Compute gross settlement amount from transactions
     */
    public BigDecimal computeSettlement(List<Transaction> transactions) {
        return transactions.stream()
                .filter(t -> t.getStatus() == Transaction.TransactionStatus.SUCCESS)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Calculate net settlement after platform fees
     */
    public BigDecimal calculateNetSettlement(BigDecimal grossAmount) {
        BigDecimal fee = grossAmount.multiply(PLATFORM_FEE_PERCENTAGE);
        return grossAmount.subtract(fee);
    }
    
    /**
     * Validate if settlement can be processed
     */
    public boolean validateSettlement(BigDecimal amount, List<Transaction> transactions) {
        // Rule 1: Amount must meet minimum threshold
        if (amount.compareTo(MIN_SETTLEMENT_AMOUNT) < 0) {
            log.warn("Settlement amount {} is below minimum {}", amount, MIN_SETTLEMENT_AMOUNT);
            return false;
        }
        
        // Rule 2: Must have at least one transaction
        if (transactions == null || transactions.isEmpty()) {
            log.warn("No transactions provided for settlement");
            return false;
        }
        
        // Rule 3: All transactions must be SUCCESS
        boolean allSuccess = transactions.stream()
                .allMatch(t -> t.getStatus() == Transaction.TransactionStatus.SUCCESS);
        
        if (!allSuccess) {
            log.warn("Not all transactions are in SUCCESS status");
            return false;
        }
        
        return true;
    }
    
    /**
     * Generate unique reference number for settlement
     */
    public String generateReferenceNumber(Long merchantId, String type) {
        long timestamp = System.currentTimeMillis();
        return String.format("SETTLE-%d-%s-%d", merchantId, type, timestamp);
    }
}
