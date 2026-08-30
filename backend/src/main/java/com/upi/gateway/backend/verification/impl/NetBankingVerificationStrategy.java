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
public class NetBankingVerificationStrategy implements VerificationStrategy {

    private static final String PAYMENT_METHOD = "NETBANKING";
    private static final long TIMEOUT_MS = 10000;
    private static final double SUCCESS_RATE = 0.82;

    @Override
    public VerificationResult verify(Transaction transaction) {
        log.info("Verifying NetBanking transaction: {}", transaction.getId());

        try {
            Thread.sleep(ThreadLocalRandom.current().nextLong(3000, 7000));

            boolean isSuccess = ThreadLocalRandom.current().nextDouble() < SUCCESS_RATE;

            if (isSuccess) {
                String providerTxnId = "NB_VER_" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

                Map<String, Object> additionalData = Map.of(
                    "verificationMethod", "BANK_STATUS_INQUIRY",
                    "bankResponse", "TRANSACTION_SUCCESSFUL",
                    "bankReferenceNumber", "BRN" + ThreadLocalRandom.current().nextLong(1000000, 9999999),
                    "verificationTime", System.currentTimeMillis()
                );

                log.info("NetBanking verification successful for transaction: {} with provider ID: {}",
                        transaction.getId(), providerTxnId);

                VerificationResult result = VerificationResult.success(providerTxnId,
                        "NetBanking transaction verified successfully");
                result.setAdditionalData(additionalData);
                return result;

            } else {
                String failureReason = getRandomNetBankingFailureReason();
                log.warn("NetBanking verification failed for transaction: {} - {}",
                        transaction.getId(), failureReason);
                return VerificationResult.failure(failureReason);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("NetBanking verification interrupted for transaction: {}", transaction.getId());
            return VerificationResult.failure("Verification process interrupted");
        } catch (Exception e) {
            log.error("NetBanking verification error for transaction: {}", transaction.getId(), e);
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

    private String getRandomNetBankingFailureReason() {
        String[] reasons = {
            "Bank system maintenance in progress",
            "Transaction not found in bank records",
            "Bank gateway timeout",
            "Invalid bank transaction reference",
            "Bank reconciliation pending",
            "Core banking system unavailable"
        };
        return reasons[ThreadLocalRandom.current().nextInt(reasons.length)];
    }
}
