package com.upi.gateway.backend.strategy.impl;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.strategy.PaymentProcessor;
import com.upi.gateway.backend.strategy.PaymentResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ThreadLocalRandom;

@Component
@Slf4j
public class UPIProcessor implements PaymentProcessor {
    
    private static final String PAYMENT_METHOD = "UPI";
    private static final int PROCESSING_DELAY_MS = 2000; // UPI is faster
    
    @Override
    public CompletableFuture<PaymentResult> process(Transaction transaction) {
        log.info("Processing UPI payment for transaction: {}", transaction.getId());
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Simulate UPI processing time
                Thread.sleep(PROCESSING_DELAY_MS);
                
                // Simulate success/failure (90% success rate for UPI)
                boolean isSuccess = ThreadLocalRandom.current().nextDouble() < 0.9;
                
                if (isSuccess) {
                    String upiTransactionId = "UPI" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                    log.info("UPI payment successful for transaction: {} with UPI ID: {}", 
                            transaction.getId(), upiTransactionId);
                    return PaymentResult.success(upiTransactionId, "UPI payment completed successfully");
                } else {
                    String failureReason = getRandomUPIFailureReason();
                    log.warn("UPI payment failed for transaction: {} - {}", transaction.getId(), failureReason);
                    return PaymentResult.failure(failureReason);
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("UPI processing interrupted for transaction: {}", transaction.getId());
                return PaymentResult.failure("Processing interrupted");
            }
        });
    }
    
    @Override
    public String getPaymentMethod() {
        return PAYMENT_METHOD;
    }
    
    @Override
    public boolean canProcess(Transaction transaction) {
        return PAYMENT_METHOD.equalsIgnoreCase(transaction.getPaymentMethod()) &&
               transaction.getAmount().doubleValue() <= 100000; // UPI limit
    }
    
    private String getRandomUPIFailureReason() {
        String[] reasons = {
            "Insufficient balance",
            "UPI PIN incorrect",
            "Transaction timeout",
            "Bank server unavailable",
            "Daily limit exceeded"
        };
        return reasons[ThreadLocalRandom.current().nextInt(reasons.length)];
    }
}