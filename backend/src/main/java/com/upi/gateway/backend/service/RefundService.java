package com.upi.gateway.backend.service;

import com.upi.gateway.backend.dto.RefundRequest;
import com.upi.gateway.backend.dto.RefundResponse;
import com.upi.gateway.backend.manager.RefundManager;
import com.upi.gateway.backend.model.Refund;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.RefundRepository;
import com.upi.gateway.backend.repository.TransactionRepository;
import com.upi.gateway.backend.strategy.RefundProcessor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefundService {
    
    private final TransactionRepository transactionRepository;
    private final RefundRepository refundRepository;
    private final List<RefundProcessor> refundProcessors;
    private final RefundManager refundManager;
    
    @Transactional
    public RefundResponse processRefund(RefundRequest request) {
        log.info("Processing refund request: {}", request);
        
        // 1. Fetch transaction
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + request.getTransactionId()));
        
        BigDecimal refundAmount = BigDecimal.valueOf(request.getAmount());
        
        // 2. Validate refund using Singleton manager
        if (!refundManager.validateRefund(transaction, refundAmount)) {
            return RefundResponse.builder()
                    .transactionId(transaction.getId())
                    .amount(request.getAmount())
                    .status("FAILED")
                    .message("Refund validation failed")
                    .build();
        }
        
        // 3. Select appropriate processor (Strategy Pattern)
        RefundProcessor processor = refundProcessors.stream()
                .filter(p -> p.supports(request.getType()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported refund type: " + request.getType()));
        
        // 4. Process refund
        Refund refund = processor.processRefund(transaction, refundAmount, request.getReason());
        
        // 5. Save refund record
        Refund savedRefund = refundRepository.save(refund);
        
        // 6. Update transaction status and total refunded
        BigDecimal newTotalRefunded = transaction.getTotalRefunded().add(refundAmount);
        transaction.setTotalRefunded(newTotalRefunded);
        
        // If fully refunded, update status
        if (refundManager.isFullyRefunded(transaction)) {
            transaction.setStatus(Transaction.TransactionStatus.REFUNDED);
        }
        
        transactionRepository.save(transaction);
        
        log.info("Refund processed successfully: {}", savedRefund.getId());
        
        return RefundResponse.builder()
                .refundId(savedRefund.getId())
                .transactionId(savedRefund.getTransactionId())
                .amount(savedRefund.getAmount().doubleValue())
                .status(savedRefund.getStatus().name())
                .type(savedRefund.getType().name())
                .reason(savedRefund.getReason())
                .createdAt(savedRefund.getCreatedAt())
                .processedAt(savedRefund.getProcessedAt())
                .message("Refund processed successfully")
                .build();
    }
    
    public List<RefundResponse> getRefundsByTransaction(UUID transactionId) {
        List<Refund> refunds = refundRepository.findByTransactionIdOrderByCreatedAtDesc(transactionId);
        
        return refunds.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public BigDecimal getRemainingRefundableAmount(UUID transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        
        return refundManager.getRemainingRefundableAmount(transaction);
    }
    
    private RefundResponse mapToResponse(Refund refund) {
        return RefundResponse.builder()
                .refundId(refund.getId())
                .transactionId(refund.getTransactionId())
                .amount(refund.getAmount().doubleValue())
                .status(refund.getStatus().name())
                .type(refund.getType().name())
                .reason(refund.getReason())
                .createdAt(refund.getCreatedAt())
                .processedAt(refund.getProcessedAt())
                .build();
    }
}
