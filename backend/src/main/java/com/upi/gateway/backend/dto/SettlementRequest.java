package com.upi.gateway.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SettlementRequest {
    
    @NotNull(message = "Merchant ID is required")
    private Long merchantId;
    
    @NotNull(message = "Settlement type is required (DAILY, WEEKLY, MANUAL)")
    private String type;
}
