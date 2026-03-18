package com.upi.gateway.backend.verification.impl;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.verification.VerificationResult;
import com.upi.gateway.backend.verification.VerificationStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

/**
 * UPI verification strategy implementation
 * Simulates verification with UPI payment providers
 */
@Component
@Slf4j
public class UpiVerificationStrategy implements VerificationStrategy {
    
    private static final String PAYMENT_METHOD = "UPI";
    private static final long TIMEOUT_MS = 5000; // 5 seconds
    private static final double SUCCESS_RATE = 0.95; // 95% success rate for verification
    
    @Override
    public VerificationResult verify(Transaction transaction) {
        log.info("Verifying UPI transaction: {}", transaction.getId());
        
        try {
            // Simulate verification delay
            Thread.sleep(ThreadLocalRandom.current().nextLong(1000, 3000));
            
            // Simulate verification result based on success rate
            boolean isSuccess = ThreadLocalRandom.current().nextDouble() < SUCCESS_RATE;
            
            if (isSuccess) {
                String providerTxnId = "UPI_VER_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                
                Map<String, Object> additionalData = Map.of(
                    "verificationMethod", "UPI_STATUS_CHECK",
                    "providerResponse", "TRANSACTION_SUCCESS",
                    "verificationTime", System.currentTimeMillis()
                );
                
                log.info("UPI verification successful for transaction: {} with provider ID: {}", 
                        transaction.getId(), providerTxnId);
                
                VerificationResult result = VerificationResult.success(providerTxnId, 
                        "UPI transaction verified successfully");
                result.setAdditionalData(additionalData);
                return result;
                
            } else {
                String failureReason = getRandomUpiFailureReason();
                log.warn("UPI verification failed for transaction: {} - {}", 
                        transaction.getId(), failureReason);
                return VerificationResult.failure(failureReason);
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("UPI verification interrupted for transaction: {}", transaction.getId());
            return VerificationResult.failure("Verification process interrupted");
        } catch (Exception e) {
            log.error("UPI verification error for transaction: {}", transaction.getId(), e);
            return VerificationResult.failure("Technical error during verification: " + e.getMessage());
        }
    }
    
    @Override
    public String getType() {
        return PAYMENT_METHOD;
    }
    
    @Override
    public boolean canHandle(Transaction transaction) {
        return PAYMENT_METHOD.equalsIgnoreCase(transaction.getPaymentMethod());
    }
    
    @Override
    public long getTimeoutMs() {
        return TIMEOUT_MS;
    }
    
    private String getRandomUpiFailureReason() {
        String[] reasons = {
            "Transaction not found in UPI network",
            "UPI provider timeout",
            "Invalid UPI transaction reference",
            "UPI network unavailable",
            "Transaction status unclear"
        };
        return reasons[ThreadLocalRandom.current().nextInt(reasons.length)];
    }
}