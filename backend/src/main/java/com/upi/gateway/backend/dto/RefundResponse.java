package com.upi.gateway.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponse {
    
    private UUID refundId;
    private UUID transactionId;
    private Double amount;
    private String status;
    private String type;
    private String reason;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
    private String message;
}
