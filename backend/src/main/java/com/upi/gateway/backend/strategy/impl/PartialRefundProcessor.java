package com.upi.gateway.backend.strategy.impl;

import com.upi.gateway.backend.model.Refund;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.strategy.RefundProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * LSP Implementation: Partial Refund Processor
 * Maintains behavioral contract of RefundProcessor
 */
@Component
@Slf4j
public class PartialRefundProcessor implements RefundProcessor {
    
    @Override
    public boolean supports(String type) {
        return "PARTIAL".equalsIgnoreCase(type);
    }
    
    @Override
    public Refund processRefund(Transaction transaction, BigDecimal amount, String reason) {
        log.info("Processing PARTIAL refund for transaction: {}, amount: {}", transaction.getId(), amount);
        
        // Partial refund must be less than transaction amount
        if (amount.compareTo(transaction.getAmount()) >= 0) {
            throw new IllegalArgumentException("Partial refund amount must be less than transaction amount");
        }
        
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Partial refund amount must be positive");
        }
        
        return Refund.builder()
                .transactionId(transaction.getId())
                .amount(amount)
                .status(Refund.RefundStatus.COMPLETED)
                .type(Refund.RefundType.PARTIAL)
                .reason(reason)
                .processedBy("SYSTEM")
                .processedAt(LocalDateTime.now())
                .build();
    }
}
