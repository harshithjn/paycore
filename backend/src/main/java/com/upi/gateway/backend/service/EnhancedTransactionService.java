package com.upi.gateway.backend.service;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.observer.CallbackObserver;
import com.upi.gateway.backend.repository.TransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class EnhancedTransactionService {

    private final List<CallbackObserver> observers;
    private final TransactionRepository transactionRepository;

    @Autowired
    public EnhancedTransactionService(List<CallbackObserver> observers,
                                    TransactionRepository transactionRepository) {
        this.observers = observers;
        this.transactionRepository = transactionRepository;

        log.info("EnhancedTransactionService initialized with {} observers: {}",
                observers.size(),
                observers.stream().map(o -> o.getClass().getSimpleName()).toList());
    }

    public void notifyObservers(Transaction transaction) {
        log.info("Notifying {} observers for transaction {} with status {}",
                observers.size(), transaction.getId(), transaction.getStatus());

        observers.forEach(observer -> {
            try {
                observer.update(transaction);
            } catch (Exception e) {
                log.error("Error notifying observer {}: {}",
                        observer.getClass().getSimpleName(), e.getMessage(), e);
            }
        });
    }

    @Async
    public CompletableFuture<Void> notifyObserversAsync(Transaction transaction) {
        notifyObservers(transaction);
        return CompletableFuture.completedFuture(null);
    }

    @Transactional
    public Transaction updateTransactionStatus(UUID transactionId, Transaction.TransactionStatus newStatus) {
        log.info("Updating transaction {} status to {}", transactionId, newStatus);

        Optional<Transaction> transactionOpt = transactionRepository.findById(transactionId);
        if (transactionOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction not found: " + transactionId);
        }

        Transaction transaction = transactionOpt.get();
        Transaction.TransactionStatus oldStatus = transaction.getStatus();

        transaction.setStatus(newStatus);
        transaction = transactionRepository.save(transaction);

        log.info("Transaction {} status updated from {} to {}",
                transactionId, oldStatus, newStatus);

        notifyObservers(transaction);

        return transaction;
    }

    @Transactional
    public Transaction updateTransactionStatus(UUID transactionId,
                                             Transaction.TransactionStatus newStatus,
                                             String failureReason) {
        log.info("Updating transaction {} status to {} with reason: {}",
                transactionId, newStatus, failureReason);

        Optional<Transaction> transactionOpt = transactionRepository.findById(transactionId);
        if (transactionOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction not found: " + transactionId);
        }

        Transaction transaction = transactionOpt.get();
        Transaction.TransactionStatus oldStatus = transaction.getStatus();

        transaction.setStatus(newStatus);
        if (failureReason != null && newStatus == Transaction.TransactionStatus.FAILED) {
            transaction.setFailureReason(failureReason);
        }

        transaction = transactionRepository.save(transaction);

        log.info("Transaction {} status updated from {} to {} with reason: {}",
                transactionId, oldStatus, newStatus, failureReason);

        notifyObservers(transaction);

        return transaction;
    }

    @Async
    public CompletableFuture<Transaction> processTransactionWithNotifications(UUID transactionId) {
        try {
            Transaction transaction = updateTransactionStatus(transactionId, Transaction.TransactionStatus.INITIATED);
            Thread.sleep(1000);

            transaction = updateTransactionStatus(transactionId, Transaction.TransactionStatus.PROCESSING);
            Thread.sleep(2000);

            boolean success = Math.random() < 0.9;
            if (success) {
                transaction = updateTransactionStatus(transactionId, Transaction.TransactionStatus.SUCCESS);
            } else {
                transaction = updateTransactionStatus(transactionId, Transaction.TransactionStatus.FAILED,
                        "Simulated processing failure");
            }

            return CompletableFuture.completedFuture(transaction);

        } catch (Exception e) {
            log.error("Error processing transaction {}: {}", transactionId, e.getMessage(), e);
            return CompletableFuture.failedFuture(e);
        }
    }

    public Optional<Transaction> getTransaction(UUID transactionId) {
        return transactionRepository.findById(transactionId);
    }

    public int getObserverCount() {
        return observers.size();
    }

    public List<String> getObserverTypes() {
        return observers.stream()
                .map(observer -> observer.getClass().getSimpleName())
                .toList();
    }
}
