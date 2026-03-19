package com.upi.gateway.backend.service;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.TransactionRepository;
import com.upi.gateway.backend.state.TransactionStateFactory;
import com.upi.gateway.backend.state.TransactionStateHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Transaction Status Service following State Pattern
 * Implements strict state transition validation and observer notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionStatusService {
    
    private final TransactionRepository repository;
    private final TransactionStateFactory stateFactory;
    private final EnhancedTransactionService transactionService; // Observer trigger
    
    /**
     * Update transaction status with state validation
     * @param id Transaction ID
     * @param newStatus Target status
     * @return Updated transaction
     * @throws IllegalArgumentException if transaction not found
     * @throws IllegalStateException if transition is invalid
     */
    @Transactional
    public Transaction updateStatus(UUID id, String newStatus) {
        log.info("Updating transaction {} status to {}", id, newStatus);
        
        Transaction txn = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
        
        String currentStatus = txn.getStatus().toString();
        TransactionStateHandler currentState = stateFactory.getHandler(currentStatus);
        
        // Validate state transition
        if (!currentState.canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                String.format("Invalid transition from %s to %s for transaction %s", 
                    currentStatus, newStatus, id));
        }
        
        // Update transaction
        txn.setStatus(Transaction.TransactionStatus.valueOf(newStatus));
        txn.setUpdatedAt(LocalDateTime.now());
        
        Transaction updated = repository.save(txn);
        
        log.info("Transaction {} status updated from {} to {}", id, currentStatus, newStatus);
        
        // Trigger observer system (callback notifications)
        transactionService.notifyObservers(updated);
        
        return updated;
    }
    
    /**
     * Update transaction status with failure reason
     * @param id Transaction ID
     * @param newStatus Target status
     * @param failureReason Reason for failure (used when status is FAILED)
     * @return Updated transaction
     */
    @Transactional
    public Transaction updateStatus(UUID id, String newStatus, String failureReason) {
        log.info("Updating transaction {} status to {} with reason: {}", id, newStatus, failureReason);
        
        Transaction txn = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
        
        String currentStatus = txn.getStatus().toString();
        TransactionStateHandler currentState = stateFactory.getHandler(currentStatus);
        
        // Validate state transition
        if (!currentState.canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                String.format("Invalid transition from %s to %s for transaction %s", 
                    currentStatus, newStatus, id));
        }
        
        // Update transaction
        txn.setStatus(Transaction.TransactionStatus.valueOf(newStatus));
        txn.setUpdatedAt(LocalDateTime.now());
        
        if (failureReason != null && "FAILED".equals(newStatus)) {
            txn.setFailureReason(failureReason);
        }
        
        Transaction updated = repository.save(txn);
        
        log.info("Transaction {} status updated from {} to {} with reason: {}", 
                id, currentStatus, newStatus, failureReason);
        
        // Trigger observer system (callback notifications)
        transactionService.notifyObservers(updated);
        
        return updated;
    }
    
    /**
     * Get transaction by ID with state metadata
     * @param id Transaction ID
     * @return Transaction with state information
     */
    public Optional<TransactionWithStateInfo> getTransactionWithState(UUID id) {
        return repository.findById(id)
                .map(this::enrichWithStateInfo);
    }
    
    /**
     * Get transactions by merchant ID with pagination
     * @param merchantId Merchant ID
     * @param pageable Pagination parameters
     * @return Page of transactions with state information
     */
    public Page<TransactionWithStateInfo> getTransactionsByMerchant(Long merchantId, Pageable pageable) {
        return repository.findByMerchantIdOrderByCreatedAtDesc(merchantId, pageable)
                .map(this::enrichWithStateInfo);
    }
    
    /**
     * Get transactions by merchant ID and status
     * @param merchantId Merchant ID
     * @param status Transaction status
     * @param pageable Pagination parameters
     * @return Page of transactions
     */
    public Page<Transaction> getTransactionsByMerchantAndStatus(Long merchantId, 
                                                              Transaction.TransactionStatus status, 
                                                              Pageable pageable) {
        return repository.findByMerchantIdAndStatusOrderByCreatedAtDesc(merchantId, status, pageable);
    }
    
    /**
     * Get all transactions by merchant ID
     * @param merchantId Merchant ID
     * @return List of transactions with state information
     */
    public List<TransactionWithStateInfo> getAllTransactionsByMerchant(Long merchantId) {
        return repository.findByMerchantIdOrderByCreatedAtDesc(merchantId)
                .stream()
                .map(this::enrichWithStateInfo)
                .toList();
    }
    
    /**
     * Get valid next states for a transaction
     * @param id Transaction ID
     * @return List of valid next states
     */
    public List<String> getValidNextStates(UUID id) {
        return repository.findById(id)
                .map(txn -> {
                    String currentStatus = txn.getStatus().toString();
                    return stateFactory.getValidNextStates(currentStatus);
                })
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
    }
    
    /**
     * Check if a state transition is valid
     * @param id Transaction ID
     * @param targetStatus Target status
     * @return true if transition is valid
     */
    public boolean isValidTransition(UUID id, String targetStatus) {
        return repository.findById(id)
                .map(txn -> {
                    String currentStatus = txn.getStatus().toString();
                    return stateFactory.isValidTransition(currentStatus, targetStatus);
                })
                .orElse(false);
    }
    
    /**
     * Enrich transaction with state information
     */
    private TransactionWithStateInfo enrichWithStateInfo(Transaction transaction) {
        String currentStatus = transaction.getStatus().toString();
        TransactionStateHandler stateHandler = stateFactory.getHandler(currentStatus);
        
        return TransactionWithStateInfo.builder()
                .transaction(transaction)
                .currentState(currentStatus)
                .description(stateHandler.getDescription())
                .isTerminal(stateHandler.isTerminal())
                .allowsVerification(stateHandler.allowsVerification())
                .validNextStates(stateHandler.getValidNextStates())
                .build();
    }
    
    /**
     * Data class for transaction with state metadata
     */
    @lombok.Data
    @lombok.Builder
    public static class TransactionWithStateInfo {
        private Transaction transaction;
        private String currentState;
        private String description;
        private boolean isTerminal;
        private boolean allowsVerification;
        private List<String> validNextStates;
    }
}