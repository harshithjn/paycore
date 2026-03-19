package com.upi.gateway.backend.strategy.impl;

import com.upi.gateway.backend.model.Refund;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.strategy.RefundProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * LSP Implementation: Full Refund Processor
 * Maintains behavioral contract of RefundProcessor
 */
@Component
@Slf4j
public class FullRefundProcessor implements RefundProcessor {
    
    @Override
    public boolean supports(String type) {
        return "FULL".equalsIgnoreCase(type);
    }
    
    @Override
    public Refund processRefund(Transaction transaction, BigDecimal amount, String reason) {
        log.info("Processing FULL refund for transaction: {}", transaction.getId());
        
        // Full refund must match transaction amount
        if (amount.compareTo(transaction.getAmount()) != 0) {
            throw new IllegalArgumentException("Full refund amount must equal transaction amount");
        }
        
        return Refund.builder()
                .transactionId(transaction.getId())
                .amount(transaction.getAmount())
                .status(Refund.RefundStatus.COMPLETED)
                .type(Refund.RefundType.FULL)
                .reason(reason)
                .processedBy("SYSTEM")
                .processedAt(LocalDateTime.now())
                .build();
    }
}
