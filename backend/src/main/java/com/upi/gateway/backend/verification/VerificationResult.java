package com.upi.gateway.backend.verification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Result of payment verification
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationResult {
    
    private boolean success;
    private String status; // SUCCESS, FAILED, PROCESSING
    private String message;
    private String providerTransactionId;
    private String failureReason;
    private LocalDateTime verifiedAt;
    private Map<String, Object> additionalData;
    
    public static VerificationResult success(String providerTransactionId, String message) {
        return VerificationResult.builder()
                .success(true)
                .status("SUCCESS")
                .providerTransactionId(providerTransactionId)
                .message(message)
                .verifiedAt(LocalDateTime.now())
                .build();
    }
    
    public static VerificationResult failure(String reason) {
        return VerificationResult.builder()
                .success(false)
                .status("FAILED")
                .failureReason(reason)
                .message("Verification failed: " + reason)
                .verifiedAt(LocalDateTime.now())
                .build();
    }
    
    public static VerificationResult processing(String message) {
        return VerificationResult.builder()
                .success(true)
                .status("PROCESSING")
                .message(message)
                .verifiedAt(LocalDateTime.now())
                .build();
    }
}