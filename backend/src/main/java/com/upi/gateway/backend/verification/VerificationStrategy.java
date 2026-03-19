package com.upi.gateway.backend.verification;

import com.upi.gateway.backend.model.Transaction;

/**
 * Strategy interface for payment verification
 * Following Strategy Pattern and Open-Closed Principle
 */
public interface VerificationStrategy {
    
    /**
     * Verify the transaction with the payment provider
     * @param transaction Transaction to verify
     * @return VerificationResult containing status and details
     */
    VerificationResult verify(Transaction transaction);
    
    /**
     * Get the payment method type this strategy handles
     * @return Payment method type (UPI, CARD, NETBANKING, etc.)
     */
    String getType();
    
    /**
     * Check if this strategy can handle the given transaction
     * @param transaction Transaction to check
     * @return true if can handle, false otherwise
     */
    boolean canHandle(Transaction transaction);
    
    /**
     * Get verification timeout in milliseconds
     * @return Timeout value
     */
    long getTimeoutMs();
}