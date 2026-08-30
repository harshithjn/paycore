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

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVerificationService implements TransactionSubject {

    private final TransactionRepository transactionRepository;
    private final TransactionStateFactory stateFactory;
    private final VerificationFactory verificationFactory;
    private final com.upi.gateway.backend.repository.CallbackLogRepository callbackLogRepository;
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

    @Transactional
    public Transaction verifyPayment(UUID transactionId) {
        log.info("Starting verification for transaction: {}", transactionId);

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));

        if (!stateFactory.allowsVerification(transaction.getStatus().toString())) {
            throw new IllegalArgumentException(
                "Verification not allowed for transaction in state: " + transaction.getStatus());
        }

        if (!verificationFactory.isPaymentMethodSupported(transaction.getPaymentMethod())) {
            throw new IllegalArgumentException(
                "Verification not supported for payment method: " + transaction.getPaymentMethod());
        }

        VerificationStrategy strategy = verificationFactory.getStrategy(transaction.getPaymentMethod());

        VerificationResult result = strategy.verify(transaction);

        String currentStatus = transaction.getStatus().toString();
        String newStatus = result.getStatus();

        if (!stateFactory.isValidTransition(currentStatus, newStatus)) {
            throw new IllegalStateException(
                String.format("Invalid state transition from %s to %s for transaction %s",
                    currentStatus, newStatus, transactionId));
        }

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

        transaction = transactionRepository.save(transaction);

        log.info("Verification completed for transaction {} with result: {} -> {}",
                transactionId, currentStatus, newStatus);

        notifyObservers(transaction);

        return transaction;
    }

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

    @Transactional
    public Transaction updateTransactionStatus(UUID transactionId, String fromStatus, String toStatus, String reason) {
        log.info("Updating transaction {} status from {} to {} - Reason: {}",
                transactionId, fromStatus, toStatus, reason);

        if (!stateFactory.isValidTransition(fromStatus, toStatus)) {
            throw new IllegalStateException(
                String.format("Invalid state transition from %s to %s", fromStatus, toStatus));
        }

        Optional<Transaction> transactionOpt = transactionRepository.findById(transactionId);
        if (transactionOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction not found: " + transactionId);
        }

        Transaction transaction = transactionOpt.get();

        if (!transaction.getStatus().toString().equals(fromStatus)) {
            throw new IllegalStateException(
                String.format("Transaction %s is in state %s, expected %s",
                    transactionId, transaction.getStatus(), fromStatus));
        }

        transaction.setStatus(Transaction.TransactionStatus.valueOf(toStatus));
        if (reason != null && toStatus.equals("FAILED")) {
            transaction.setFailureReason(reason);
        }

        transaction = transactionRepository.save(transaction);

        notifyObservers(transaction);

        return transaction;
    }

    public TransactionStatusData getTransactionStatus(UUID transactionId) {
        Optional<Transaction> transactionOpt = transactionRepository.findById(transactionId);
        if (transactionOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction not found: " + transactionId);
        }

        Transaction transaction = transactionOpt.get();
        String currentState = transaction.getStatus().toString();

        TransactionStateHandler stateHandler = stateFactory.getHandler(currentState);

        List<com.upi.gateway.backend.model.CallbackLog> logs =
            callbackLogRepository.findByTransactionIdOrderByTimestampDesc(transactionId);

        return TransactionStatusData.builder()
                .transaction(transaction)
                .currentState(currentState)
                .description(stateHandler.getDescription())
                .isTerminal(stateHandler.isTerminal())
                .allowsVerification(stateHandler.allowsVerification())
                .validNextStates(stateHandler.getValidNextStates())
                .callbackLogs(logs)
                .build();
    }

    @lombok.Data
    @lombok.Builder
    public static class TransactionStatusData {
        private Transaction transaction;
        private String currentState;
        private String description;
        private boolean isTerminal;
        private boolean allowsVerification;
        private List<String> validNextStates;
        private List<com.upi.gateway.backend.model.CallbackLog> callbackLogs;
    }
}
