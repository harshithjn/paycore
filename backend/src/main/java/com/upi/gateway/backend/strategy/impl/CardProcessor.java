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
public class CardProcessor implements PaymentProcessor {
    
    private static final String PAYMENT_METHOD = "CARD";
    private static final int PROCESSING_DELAY_MS = 4000; // Card processing is slower
    
    @Override
    public CompletableFuture<PaymentResult> process(Transaction transaction) {
        log.info("Processing Card payment for transaction: {}", transaction.getId());
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Simulate card processing time
                Thread.sleep(PROCESSING_DELAY_MS);
                
                // Simulate success/failure (85% success rate for cards)
                boolean isSuccess = ThreadLocalRandom.current().nextDouble() < 0.85;
                
                if (isSuccess) {
                    String cardTransactionId = "CARD" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                    log.info("Card payment successful for transaction: {} with Card ID: {}", 
                            transaction.getId(), cardTransactionId);
                    return PaymentResult.success(cardTransactionId, "Card payment processed successfully");
                } else {
                    String failureReason = getRandomCardFailureReason();
                    log.warn("Card payment failed for transaction: {} - {}", transaction.getId(), failureReason);
                    return PaymentResult.failure(failureReason);
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Card processing interrupted for transaction: {}", transaction.getId());
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
               transaction.getAmount().doubleValue() >= 1; // Minimum card amount
    }
    
    private String getRandomCardFailureReason() {
        String[] reasons = {
            "Card declined by bank",
            "Insufficient funds",
            "Card expired",
            "Invalid CVV",
            "Transaction limit exceeded",
            "Card blocked"
        };
        return reasons[ThreadLocalRandom.current().nextInt(reasons.length)];
    }
}