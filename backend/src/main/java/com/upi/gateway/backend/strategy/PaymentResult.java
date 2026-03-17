package com.upi.gateway.backend.strategy;

import com.upi.gateway.backend.model.Transaction.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResult {
    private boolean success;
    private TransactionStatus status;
    private String message;
    private String transactionId;
    private String failureReason;
    
    public static PaymentResult success(String transactionId, String message) {
        return PaymentResult.builder()
                .success(true)
                .status(TransactionStatus.SUCCESS)
                .transactionId(transactionId)
                .message(message)
                .build();
    }
    
    public static PaymentResult failure(String reason) {
        return PaymentResult.builder()
                .success(false)
                .status(TransactionStatus.FAILED)
                .failureReason(reason)
                .message("Payment failed: " + reason)
                .build();
    }
    
    public static PaymentResult processing(String message) {
        return PaymentResult.builder()
                .success(true)
                .status(TransactionStatus.PROCESSING)
                .message(message)
                .build();
    }
}