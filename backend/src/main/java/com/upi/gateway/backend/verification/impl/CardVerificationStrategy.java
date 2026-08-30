package com.upi.gateway.backend.verification.impl;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.verification.VerificationResult;
import com.upi.gateway.backend.verification.VerificationStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Component
@Slf4j
public class CardVerificationStrategy implements VerificationStrategy {

    private static final String PAYMENT_METHOD = "CARD";
    private static final long TIMEOUT_MS = 8000;
    private static final double SUCCESS_RATE = 0.88;

    @Override
    public VerificationResult verify(Transaction transaction) {
        log.info("Verifying Card transaction: {}", transaction.getId());

        try {
            Thread.sleep(ThreadLocalRandom.current().nextLong(2000, 5000));

            boolean isSuccess = ThreadLocalRandom.current().nextDouble() < SUCCESS_RATE;

            if (isSuccess) {
                String providerTxnId = "CARD_VER_" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

                Map<String, Object> additionalData = Map.of(
                    "verificationMethod", "CARD_NETWORK_CHECK",
                    "networkResponse", "APPROVED",
                    "authCode", "AUTH" + ThreadLocalRandom.current().nextInt(100000, 999999),
                    "verificationTime", System.currentTimeMillis()
                );

                log.info("Card verification successful for transaction: {} with provider ID: {}",
                        transaction.getId(), providerTxnId);

                VerificationResult result = VerificationResult.success(providerTxnId,
                        "Card transaction verified successfully");
                result.setAdditionalData(additionalData);
                return result;

            } else {
                String failureReason = getRandomCardFailureReason();
                log.warn("Card verification failed for transaction: {} - {}",
                        transaction.getId(), failureReason);
                return VerificationResult.failure(failureReason);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Card verification interrupted for transaction: {}", transaction.getId());
            return VerificationResult.failure("Verification process interrupted");
        } catch (Exception e) {
            log.error("Card verification error for transaction: {}", transaction.getId(), e);
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

    private String getRandomCardFailureReason() {
        String[] reasons = {
            "Card network timeout",
            "Transaction not found in card network",
            "Invalid authorization code",
            "Card issuer unavailable",
            "Settlement status pending",
            "Chargeback risk detected"
        };
        return reasons[ThreadLocalRandom.current().nextInt(reasons.length)];
    }
}
