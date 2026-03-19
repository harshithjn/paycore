package com.upi.gateway.backend.strategy;

import com.upi.gateway.backend.model.Refund;
import com.upi.gateway.backend.model.Transaction;

import java.math.BigDecimal;

/**
 * Interface Segregation Principle (ISP):
 * Clean, focused interface for refund processing
 */
public interface RefundProcessor {
    
    /**
     * Check if this processor supports the given refund type
     */
    boolean supports(String type);
    
    /**
     * Process refund for a transaction
     * Liskov Substitution Principle (LSP):
     * All implementations must be interchangeable and maintain behavior expectations
     */
    Refund processRefund(Transaction transaction, BigDecimal amount, String reason);
}
