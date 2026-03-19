package com.upi.gateway.backend.strategy;

import com.upi.gateway.backend.model.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Interface Segregation Principle (ISP):
 * Clean, focused interface for settlement calculation
 */
public interface SettlementCalculator {
    
    /**
     * Check if this calculator supports the given settlement type
     */
    boolean supports(String type);
    
    /**
     * Calculate settlement amount from transactions
     * Liskov Substitution Principle (LSP):
     * All implementations must be interchangeable
     */
    BigDecimal calculate(List<Transaction> transactions);
    
    /**
     * Get period boundaries for this settlement type
     */
    LocalDateTime[] getPeriodBoundaries();
}
