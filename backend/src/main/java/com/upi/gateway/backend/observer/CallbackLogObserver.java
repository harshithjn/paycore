package com.upi.gateway.backend.observer;

import com.upi.gateway.backend.model.CallbackLog;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.CallbackLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Dedicated Callback Log Observer
 * Logs all callback attempts in the database for audit trail
 * Implements both CallbackObserver and TransactionObserver for compatibility
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CallbackLogObserver implements CallbackObserver, TransactionObserver {
    
    private final CallbackLogRepository callbackLogRepository;

    @Override
    @Async
    public void update(Transaction transaction) {
        log.info("CallbackLogObserver: Logging callback attempt for transaction {} with status {}", 
                transaction.getId(), transaction.getStatus());
        
        try {
            // Log the callback attempt
            CallbackLog callbackLog = CallbackLog.builder()
                .transactionId(transaction.getId())
                .statusSent(transaction.getStatus().toString())
                .callbackUrl("SYSTEM_LOG") // Indicates this is a system log entry
                .responseCode(200) // System log always successful
                .responseBody("Transaction status change logged: " + transaction.getStatus())
                .retryCount(0)
                .build();

            callbackLogRepository.save(callbackLog);
            
            log.debug("Successfully logged callback attempt for transaction {}", transaction.getId());
            
        } catch (Exception e) {
            log.error("Error in CallbackLogObserver for transaction {}: {}", 
                    transaction.getId(), e.getMessage(), e);
        }
    }
    
    /**
     * Log custom callback event
     * @param transactionId Transaction ID
     * @param eventType Type of event
     * @param details Event details
     */
    public void logCustomEvent(String transactionId, String eventType, String details) {
        try {
            CallbackLog callbackLog = CallbackLog.builder()
                .transactionId(java.util.UUID.fromString(transactionId))
                .statusSent(eventType)
                .callbackUrl("CUSTOM_EVENT")
                .responseCode(200)
                .responseBody(details)
                .retryCount(0)
                .build();

            callbackLogRepository.save(callbackLog);
            
            log.info("Logged custom event {} for transaction {}: {}", eventType, transactionId, details);
            
        } catch (Exception e) {
            log.error("Error logging custom event: {}", e.getMessage());
        }
    }
    
    @Override
    public String getType() {
        return "CallbackLogObserver";
    }
}