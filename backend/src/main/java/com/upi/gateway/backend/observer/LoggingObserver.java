package com.upi.gateway.backend.observer;

import com.upi.gateway.backend.model.CallbackLog;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.CallbackLogRepository;
import com.upi.gateway.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoggingObserver implements TransactionObserver {

    private final CallbackLogRepository callbackLogRepository;
    private final TransactionRepository transactionRepository;

    @Override
    @Async
    public void update(Transaction transaction) {
        log.info("LoggingObserver: Processing transaction {} with status {}",
                transaction.getId(), transaction.getStatus());

        try {
            logCallbackAttempt(transaction);

            updateVerificationAttempts(transaction.getId());

        } catch (Exception e) {
            log.error("Error in LoggingObserver for transaction {}: {}",
                    transaction.getId(), e.getMessage(), e);
        }
    }

    private void logCallbackAttempt(Transaction transaction) {
        try {
            CallbackLog logEntry = CallbackLog.builder()
                .transactionId(transaction.getId())
                .statusSent(transaction.getStatus().toString())
                .callbackUrl("INTERNAL_LOG")
                .responseCode(200)
                .responseBody("Callback attempt logged for status: " + transaction.getStatus())
                .retryCount(0)
                .build();

            callbackLogRepository.save(logEntry);

            log.info("Logged callback attempt for transaction {}", transaction.getId());
        } catch (Exception e) {
            log.error("Error logging callback attempt: {}", e.getMessage());
        }
    }

    private void updateVerificationAttempts(UUID transactionId) {
        try {
            Optional<Transaction> transactionOpt = transactionRepository.findById(transactionId);
            if (transactionOpt.isPresent()) {
                Transaction transaction = transactionOpt.get();
                transaction.setVerificationAttempts(
                    (transaction.getVerificationAttempts() != null ? transaction.getVerificationAttempts() : 0) + 1
                );
                transaction.setLastVerifiedAt(LocalDateTime.now());
                transactionRepository.save(transaction);

                log.info("Updated verification attempts for transaction {}", transactionId);
            }
        } catch (Exception e) {
            log.error("Error updating verification attempts: {}", e.getMessage());
        }
    }

    public void logCustomEvent(UUID transactionId, String eventType, Object eventData) {
        try {
            CallbackLog logEntry = CallbackLog.builder()
                .transactionId(transactionId)
                .statusSent(eventType)
                .callbackUrl("CUSTOM_EVENT")
                .responseCode(200)
                .responseBody(eventData.toString())
                .retryCount(0)
                .build();

            callbackLogRepository.save(logEntry);

            log.info("Logged custom event {} for transaction {}", eventType, transactionId);
        } catch (Exception e) {
            log.error("Error logging custom event: {}", e.getMessage());
        }
    }

    @Override
    public String getType() {
        return "LoggingObserver";
    }
}
