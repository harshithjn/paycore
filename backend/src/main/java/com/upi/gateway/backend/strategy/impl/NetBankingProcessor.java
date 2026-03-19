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
public class NetBankingProcessor implements PaymentProcessor {
    
    private static final String PAYMENT_METHOD = "NETBANKING";
    private static final int PROCESSING_DELAY_MS = 6000; // NetBanking is slowest
    
    @Override
    public CompletableFuture<PaymentResult> process(Transaction transaction) {
        log.info("Processing NetBanking payment for transaction: {}", transaction.getId());
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Simulate NetBanking processing time
                Thread.sleep(PROCESSING_DELAY_MS);
                
                // Simulate success/failure (80% success rate for NetBanking)
                boolean isSuccess = ThreadLocalRandom.current().nextDouble() < 0.8;
                
                if (isSuccess) {
                    String netBankingTransactionId = "NB" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
                    log.info("NetBanking payment successful for transaction: {} with NB ID: {}", 
                            transaction.getId(), netBankingTransactionId);
                    return PaymentResult.success(netBankingTransactionId, "NetBanking payment completed successfully");
                } else {
                    String failureReason = getRandomNetBankingFailureReason();
                    log.warn("NetBanking payment failed for transaction: {} - {}", transaction.getId(), failureReason);
                    return PaymentResult.failure(failureReason);
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("NetBanking processing interrupted for transaction: {}", transaction.getId());
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
               transaction.getAmount().doubleValue() >= 1; // Minimum NetBanking amount
    }
    
    private String getRandomNetBankingFailureReason() {
        String[] reasons = {
            "Bank server maintenance",
            "Session timeout",
            "Invalid credentials",
            "Account temporarily blocked",
            "Daily transaction limit reached",
            "Technical error at bank"
        };
        return reasons[ThreadLocalRandom.current().nextInt(reasons.length)];
    }
}