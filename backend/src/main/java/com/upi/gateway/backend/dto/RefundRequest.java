package com.upi.gateway.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.UUID;

@Data
public class RefundRequest {
    
    @NotNull(message = "Transaction ID is required")
    private UUID transactionId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
    
    @NotNull(message = "Type is required (FULL or PARTIAL)")
    private String type;
    
    private String reason;
}
