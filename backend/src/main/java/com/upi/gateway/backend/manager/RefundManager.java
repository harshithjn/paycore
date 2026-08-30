package com.upi.gateway.backend.manager;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.RefundRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class RefundManager {

    private static RefundManager instance;

    private final RefundRepository refundRepository;

    private static final BigDecimal MIN_REFUND_AMOUNT = new BigDecimal("1.00");

    @PostConstruct
    public void init() {
        instance = this;
        log.info("RefundManager singleton initialized");
    }

    public static RefundManager getInstance() {
        if (instance == null) {
            throw new IllegalStateException("RefundManager not initialized");
        }
        return instance;
    }

    public boolean validateRefund(Transaction transaction, BigDecimal amount) {
        if (transaction.getStatus() != Transaction.TransactionStatus.SUCCESS
                && transaction.getStatus() != Transaction.TransactionStatus.SETTLED) {
            log.warn("Cannot refund transaction in status: {}", transaction.getStatus());
            return false;
        }

        if (amount.compareTo(MIN_REFUND_AMOUNT) < 0) {
            log.warn("Refund amount {} is below minimum {}", amount, MIN_REFUND_AMOUNT);
            return false;
        }

        if (amount.compareTo(transaction.getAmount()) > 0) {
            log.warn("Refund amount {} exceeds transaction amount {}", amount, transaction.getAmount());
            return false;
        }

        BigDecimal totalRefunded = refundRepository.getTotalRefundedAmount(transaction.getId());
        BigDecimal remainingAmount = transaction.getAmount().subtract(totalRefunded);

        if (amount.compareTo(remainingAmount) > 0) {
            log.warn("Refund amount {} exceeds remaining refundable amount {}", amount, remainingAmount);
            return false;
        }

        return true;
    }

    public BigDecimal getRemainingRefundableAmount(Transaction transaction) {
        BigDecimal totalRefunded = refundRepository.getTotalRefundedAmount(transaction.getId());
        return transaction.getAmount().subtract(totalRefunded);
    }

    public boolean isFullyRefunded(Transaction transaction) {
        BigDecimal totalRefunded = refundRepository.getTotalRefundedAmount(transaction.getId());
        return totalRefunded.compareTo(transaction.getAmount()) >= 0;
    }
}
