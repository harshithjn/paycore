package com.upi.gateway.backend.dto;

import com.upi.gateway.backend.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionStatusResponse {
    private UUID id;
    private Long merchantId;
    private BigDecimal amount;
    private Transaction.TransactionStatus status;
    private String paymentMethod;
    private String merchantTransactionId;
    private String customerEmail;
    private String customerPhone;
    private String failureReason;
    private String upiTransactionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TransactionStatusResponse from(Transaction transaction) {
        return TransactionStatusResponse.builder()
                .id(transaction.getId())
                .merchantId(transaction.getMerchantId())
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .paymentMethod(transaction.getPaymentMethod())
                .merchantTransactionId(transaction.getMerchantTransactionId())
                .customerEmail(transaction.getCustomerEmail())
                .customerPhone(transaction.getCustomerPhone())
                .failureReason(transaction.getFailureReason())
                .upiTransactionId(transaction.getUpiTransactionId())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
}
