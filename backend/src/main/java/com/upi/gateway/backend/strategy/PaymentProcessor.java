package com.upi.gateway.backend.strategy;

import com.upi.gateway.backend.model.Transaction;
import java.util.concurrent.CompletableFuture;

/**
 * Strategy interface for payment processing
 * Following the Strategy Pattern and Open-Closed Principle
 */
public interface PaymentProcessor {
    
    /**
     * Process the payment transaction
     * @param transaction The transaction to process
     * @return CompletableFuture with processing result
     */
    CompletableFuture<PaymentResult> process(Transaction transaction);
    
    /**
     * Get the payment method this processor handles
     * @return Payment method name
     */
    String getPaymentMethod();
    
    /**
     * Validate if the transaction can be processed by this processor
     * @param transaction The transaction to validate
     * @return true if valid, false otherwise
     */
    boolean canProcess(Transaction transaction);
}