package com.upi.gateway.backend.controller;

import com.upi.gateway.backend.dto.TransactionStatusUpdateRequest;
import com.upi.gateway.backend.dto.TransactionWithStateResponse;

import com.upi.gateway.backend.service.TransactionStatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class TransactionStatusController {

    private final TransactionStatusService transactionStatusService;

    @GetMapping("/transactions")
    public ResponseEntity<Page<TransactionStatusService.TransactionWithStateInfo>> getTransactions(
            @RequestParam Long merchantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            log.info("Fetching transactions for merchant: {} (page: {}, size: {})", merchantId, page, size);

            Pageable pageable = PageRequest.of(page, size);
            Page<TransactionStatusService.TransactionWithStateInfo> transactions =
                    transactionStatusService.getTransactionsByMerchant(merchantId, pageable);

            return ResponseEntity.ok(transactions);

        } catch (Exception e) {
            log.error("Error fetching transactions for merchant {}: {}", merchantId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/transactions/all")
    public ResponseEntity<List<TransactionStatusService.TransactionWithStateInfo>> getAllTransactions(
            @RequestParam Long merchantId) {

        try {
            log.info("Fetching all transactions for merchant: {}", merchantId);

            List<TransactionStatusService.TransactionWithStateInfo> transactions =
                    transactionStatusService.getAllTransactionsByMerchant(merchantId);

            return ResponseEntity.ok(transactions);

        } catch (Exception e) {
            log.error("Error fetching all transactions for merchant {}: {}", merchantId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/transaction/{id}")
    public ResponseEntity<TransactionStatusService.TransactionWithStateInfo> getTransaction(
            @PathVariable UUID id) {

        try {
            log.info("Fetching transaction: {}", id);

            return transactionStatusService.getTransactionWithState(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());

        } catch (Exception e) {
            log.error("Error fetching transaction {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping("/transaction/{id}/status")
    public ResponseEntity<?> updateTransactionStatus(
            @PathVariable UUID id,
            @Valid @RequestBody TransactionStatusUpdateRequest request) {

        try {
            log.info("Updating transaction {} status to {}", id, request.getStatus());

            if (!transactionStatusService.isValidTransition(id, request.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid state transition to " + request.getStatus()));
            }

            if (request.getFailureReason() != null && !request.getFailureReason().trim().isEmpty()) {
                transactionStatusService.updateStatus(id, request.getStatus(), request.getFailureReason());
            } else {
                transactionStatusService.updateStatus(id, request.getStatus());
            }

            return transactionStatusService.getTransactionWithState(id)
                    .map(stateInfo -> ResponseEntity.ok(convertToResponse(stateInfo)))
                    .orElse(ResponseEntity.internalServerError().build());

        } catch (IllegalArgumentException e) {
            log.error("Invalid request for transaction {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (IllegalStateException e) {
            log.error("Invalid state transition for transaction {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("Error updating transaction {} status: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error"));
        }
    }

    @GetMapping("/transaction/{id}/next-states")
    public ResponseEntity<List<String>> getValidNextStates(@PathVariable UUID id) {

        try {
            log.info("Fetching valid next states for transaction: {}", id);

            List<String> nextStates = transactionStatusService.getValidNextStates(id);
            return ResponseEntity.ok(nextStates);

        } catch (IllegalArgumentException e) {
            log.error("Transaction not found: {}", id);
            return ResponseEntity.notFound().build();

        } catch (Exception e) {
            log.error("Error fetching next states for transaction {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private TransactionWithStateResponse convertToResponse(TransactionStatusService.TransactionWithStateInfo stateInfo) {
        return TransactionWithStateResponse.builder()
                .transaction(stateInfo.getTransaction())
                .currentState(stateInfo.getCurrentState())
                .description(stateInfo.getDescription())
                .isTerminal(stateInfo.isTerminal())
                .allowsVerification(stateInfo.isAllowsVerification())
                .validNextStates(stateInfo.getValidNextStates())
                .build();
    }
}
