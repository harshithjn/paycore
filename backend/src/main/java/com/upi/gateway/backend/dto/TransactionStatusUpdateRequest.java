package com.upi.gateway.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TransactionStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    private String status;

    private String failureReason;

    private String notes;
}
