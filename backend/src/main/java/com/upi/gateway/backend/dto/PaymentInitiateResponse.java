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
public class PaymentInitiateResponse {
    private UUID transactionId;
    private Long merchantId;
    private BigDecimal amount;
    private String paymentMethod;
    private Transaction.TransactionStatus status;
    private String message;
    private LocalDateTime createdAt;
    private String merchantTransactionId;

    public static PaymentInitiateResponse from(Transaction transaction, String message) {
        return PaymentInitiateResponse.builder()
                .transactionId(transaction.getId())
                .merchantId(transaction.getMerchantId())
                .amount(transaction.getAmount())
                .paymentMethod(transaction.getPaymentMethod())
                .status(transaction.getStatus())
                .message(message)
                .createdAt(transaction.getCreatedAt())
                .merchantTransactionId(transaction.getMerchantTransactionId())
                .build();
    }
}
