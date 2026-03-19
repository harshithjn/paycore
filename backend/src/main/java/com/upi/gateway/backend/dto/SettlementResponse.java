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
public class SettlementResponse {
    
    private UUID settlementId;
    private Long merchantId;
    private Double grossAmount;
    private Double netAmount;
    private Double platformFee;
    private String status;
    private String type;
    private Integer transactionCount;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private String referenceNumber;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
    private String message;
}
