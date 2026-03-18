package com.upi.gateway.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for transaction status updates
 */
@Data
public class TransactionStatusUpdateRequest {
    
    @NotBlank(message = "Status is required")
    private String status;
    
    private String failureReason;
    
    private String notes;
}