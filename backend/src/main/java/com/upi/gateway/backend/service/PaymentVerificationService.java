package com.upi.gateway.backend.service;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.observer.TransactionSubject;
import com.upi.gateway.backend.observer.TransactionObserver;
import com.upi.gateway.backend.repository.TransactionRepository;
import com.upi.gateway.backend.state.TransactionStateFactory;
import com.upi.gateway.backend.state.TransactionStateHandler;
import com.upi.gateway.backend.verification.VerificationFactory;
import com.upi.gateway.backend.verification.VerificationResult;
import com.upi.gateway.backend.verification.VerificationStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service for payment verification using State Pattern and Strategy Pattern
 * Following Open-Closed Principle for extensibility
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVerificationService implements TransactionSubject {
    
    private final TransactionRepository transactionRepository;
    private final TransactionStateFactory stateFactory;
    private final VerificationFactory verificationFactory;
    private final List<TransactionObserver> observers = new ArrayList<>();
    
    @Override
    public void registerObserver(TransactionObserver observer) {
        observers.add(observer);
        log.info("Registered observer: {}", observer.getType());
    }
    
    @Override
    public void removeObserver(TransactionObserver observer) {
        observers.remove(observer);
        log.info("Removed observer: {}", observer.getType());
    }
    
    @Override
    public void notifyObservers(Transaction transaction) {
        log.info("Notifying {} observers for transaction {} with status {}", 
                observers.size(), transaction.getId(), transaction.getStatus());
        
        for (TransactionObserver observer : observers) {
            try {
                observer.update(transaction);
            } catch (Exception e) {
                log.error("Error notifying observer {}: {}", observer.getType(), e.getMessage(), e);
            }
        }
    }
    
    /**
     * Verify payment transaction
     * @param transactionId Transaction ID to verify
     * @return Updated transaction with verification result
     * @throws IllegalArgumentException if transaction not found or verification not allowed
     * @throws IllegalStateException if state transition is invalid
     */
    @Transactional
    public Transaction verifyPayment(UUID transactionId) {
        log.info("Starting verification for transaction: {}", transactionId);
        
        // Step 1: Get transaction
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        
        // Step 2: Check if verification is allowed in current state
        if (!stateFactory.allowsVerification(transaction.getStatus().toString())) {
            throw new IllegalArgumentException(
                "Verification not allowed for transaction in state: " + transaction.getStatus());
        }
        
        // Step 3: Get verification strategy
        if (!verificationFactory.isPaymentMethodSupported(transaction.getPaymentMethod())) {
            throw new IllegalArgumentException(
                "Verification not supported for payment method: " + transaction.getPaymentMethod());
        }
        
        VerificationStrategy strategy = verificationFactory.getStrategy(transaction.getPaymentMethod());
        
        // Step 4: Perform verification
        VerificationResult result = strategy.verify(transaction);
        
        // Step 5: Validate state transition
        String currentStatus = transaction.getStatus().toString();
        String newStatus = result.getStatus();
        
        if (!stateFactory.isValidTransition(currentStatus, newStatus)) {
            throw new IllegalStateException(
                String.format("Invalid state transition from %s to %s for transaction %s", 
                    currentStatus, newStatus, transactionId));
        }
        
        // Step 6: Update transaction
        transaction.setStatus(Transaction.TransactionStatus.valueOf(newStatus));
        transaction.setLastVerifiedAt(LocalDateTime.now());
        transaction.setVerificationAttempts(
            (transaction.getVerificationAttempts() != null ? transaction.getVerificationAttempts() : 0) + 1
        );
        
        if (result.isSuccess() && result.getProviderTransactionId() != null) {
            transaction.setUpiTransactionId(result.getProviderTransactionId());
        }
        
        if (!result.isSuccess() && result.getFailureReason() != null) {
            transaction.setFailureReason(result.getFailureReason());
        }
        
        // Step 7: Save and notify observers
        transaction = transactionRepository.save(transaction);
        
        log.info("Verification completed for transaction {} with result: {} -> {}", 
                transactionId, currentStatus, newStatus);
        
        // Notify observers about status change
        notifyObservers(transaction);
        
        return transaction;
    }
    
    /**
     * Verify payment asynchronously
     * @param transactionId Transaction ID to verify
     * @return CompletableFuture with verification result
     */
    @Async
    public CompletableFuture<Transaction> verifyPaymentAsync(UUID transactionId) {
        try {
            Transaction result = verifyPayment(transactionId);
            return CompletableFuture.completedFuture(result);
        } catch (Exception e) {
            log.error("Async verification failed for transaction: {}", transactionId, e);
            return CompletableFuture.failedFuture(e);
        }
    }
    
    /**
     * Update transaction status with state validation
     * @param transactionId Transaction ID
     * @param fromStatus Expected current status (for validation)
     * @param toStatus Target status
     * @param reason Reason for status change
     * @return Updated transaction
     * @throws IllegalStateException if transition is invalid
     */
    @Transactional
    public Transaction updateTransactionStatus(UUID transactionId, String fromStatus, String toStatus, String reason) {
        log.info("Updating transaction {} status from {} to {} - Reason: {}", 
                transactionId, fromStatus, toStatus, reason);
        
        // Validate state transition
        if (!stateFactory.isValidTransition(fromStatus, toStatus)) {
            throw new IllegalStateException(
                String.format("Invalid state transition from %s to %s", fromStatus, toStatus));
        }
        
        Optional<Transaction> transactionOpt = transactionRepository.findById(transactionId);
        if (transactionOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction not found: " + transactionId);
        }
        
        Transaction transaction = transactionOpt.get();
        
        // Verify current status matches expected status
        if (!transaction.getStatus().toString().equals(fromStatus)) {
            throw new IllegalStateException(
                String.format("Transaction %s is in state %s, expected %s", 
                    transactionId, transaction.getStatus(), fromStatus));
        }
        
        // Update status
        transaction.setStatus(Transaction.TransactionStatus.valueOf(toStatus));
        if (reason != null && toStatus.equals("FAILED")) {
            transaction.setFailureReason(reason);
        }
        
        transaction = transactionRepository.save(transaction);
        
        // Notify observers
        notifyObservers(transaction);
        
        return transaction;
    }
    
    /**
     * Get transaction status with state metadata
     * @param transactionId Transaction ID
     * @return Transaction status response with state information
     */
    public TransactionStatusData getTransactionStatus(UUID transactionId) {
        Optional<Transaction> transactionOpt = transactionRepository.findById(transactionId);
        if (transactionOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction not found: " + transactionId);
        }
        
        Transaction transaction = transactionOpt.get();
        String currentState = transaction.getStatus().toString();
        
        TransactionStateHandler stateHandler = stateFactory.getHandler(currentState);
        
        return TransactionStatusData.builder()
                .transaction(transaction)
                .currentState(currentState)
                .description(stateHandler.getDescription())
                .isTerminal(stateHandler.isTerminal())
                .allowsVerification(stateHandler.allowsVerification())
                .validNextStates(stateHandler.getValidNextStates())
                .build();
    }
    
    /**
     * Data class for transaction status with state metadata
     */
    @lombok.Data
    @lombok.Builder
    public static class TransactionStatusData {
        private Transaction transaction;
        private String currentState;
        private String description;
        private boolean isTerminal;
        private boolean allowsVerification;
        private List<String> validNextStates;
    }
}