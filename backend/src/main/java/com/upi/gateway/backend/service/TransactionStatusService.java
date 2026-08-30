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

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionStatusService {

    private final TransactionRepository repository;
    private final TransactionStateFactory stateFactory;
    private final EnhancedTransactionService transactionService;

    @Transactional
    public Transaction updateStatus(UUID id, String newStatus) {
        log.info("Updating transaction {} status to {}", id, newStatus);

        Transaction txn = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));

        String currentStatus = txn.getStatus().toString();
        TransactionStateHandler currentState = stateFactory.getHandler(currentStatus);

        if (!currentState.canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                String.format("Invalid transition from %s to %s for transaction %s",
                    currentStatus, newStatus, id));
        }

        txn.setStatus(Transaction.TransactionStatus.valueOf(newStatus));
        txn.setUpdatedAt(LocalDateTime.now());

        Transaction updated = repository.save(txn);

        log.info("Transaction {} status updated from {} to {}", id, currentStatus, newStatus);

        transactionService.notifyObservers(updated);

        return updated;
    }

    @Transactional
    public Transaction updateStatus(UUID id, String newStatus, String failureReason) {
        log.info("Updating transaction {} status to {} with reason: {}", id, newStatus, failureReason);

        Transaction txn = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));

        String currentStatus = txn.getStatus().toString();
        TransactionStateHandler currentState = stateFactory.getHandler(currentStatus);

        if (!currentState.canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                String.format("Invalid transition from %s to %s for transaction %s",
                    currentStatus, newStatus, id));
        }

        txn.setStatus(Transaction.TransactionStatus.valueOf(newStatus));
        txn.setUpdatedAt(LocalDateTime.now());

        if (failureReason != null && "FAILED".equals(newStatus)) {
            txn.setFailureReason(failureReason);
        }

        Transaction updated = repository.save(txn);

        log.info("Transaction {} status updated from {} to {} with reason: {}",
                id, currentStatus, newStatus, failureReason);

        transactionService.notifyObservers(updated);

        return updated;
    }

    public Optional<TransactionWithStateInfo> getTransactionWithState(UUID id) {
        return repository.findById(id)
                .map(this::enrichWithStateInfo);
    }

    public Page<TransactionWithStateInfo> getTransactionsByMerchant(Long merchantId, Pageable pageable) {
        return repository.findByMerchantIdOrderByCreatedAtDesc(merchantId, pageable)
                .map(this::enrichWithStateInfo);
    }

    public Page<Transaction> getTransactionsByMerchantAndStatus(Long merchantId,
                                                              Transaction.TransactionStatus status,
                                                              Pageable pageable) {
        return repository.findByMerchantIdAndStatusOrderByCreatedAtDesc(merchantId, status, pageable);
    }

    public List<TransactionWithStateInfo> getAllTransactionsByMerchant(Long merchantId) {
        return repository.findByMerchantIdOrderByCreatedAtDesc(merchantId)
                .stream()
                .map(this::enrichWithStateInfo)
                .toList();
    }

    public List<String> getValidNextStates(UUID id) {
        return repository.findById(id)
                .map(txn -> {
                    String currentStatus = txn.getStatus().toString();
                    return stateFactory.getValidNextStates(currentStatus);
                })
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
    }

    public boolean isValidTransition(UUID id, String targetStatus) {
        return repository.findById(id)
                .map(txn -> {
                    String currentStatus = txn.getStatus().toString();
                    return stateFactory.isValidTransition(currentStatus, targetStatus);
                })
                .orElse(false);
    }

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
