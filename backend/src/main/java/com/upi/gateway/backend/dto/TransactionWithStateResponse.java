package com.upi.gateway.backend.dto;

import com.upi.gateway.backend.model.Transaction;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Response DTO for transaction with state information
 */
@Data
@Builder
public class TransactionWithStateResponse {
    
    private Transaction transaction;
    private String currentState;
    private String description;
    private boolean isTerminal;
    private boolean allowsVerification;
    private List<String> validNextStates;
}