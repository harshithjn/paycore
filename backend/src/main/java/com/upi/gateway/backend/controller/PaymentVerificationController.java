package com.upi.gateway.backend.controller;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.service.PaymentVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;


/**
 * Controller for payment verification operations
 */
@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PaymentVerificationController {
    
    private final PaymentVerificationService verificationService;
    
    /**
     * Verify a payment transaction
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> request) {
        try {
            String transactionIdStr = request.get("transactionId");
            if (transactionIdStr == null || transactionIdStr.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Transaction ID is required"));
            }
            
            UUID transactionId = UUID.fromString(transactionIdStr);
            log.info("Verification request received for transaction: {}", transactionId);
            
            Transaction result = verificationService.verifyPayment(transactionId);
            
            return ResponseEntity.ok(Map.of(
                "transactionId", result.getId().toString(),
                "status", result.getStatus().toString(),
                "message", "Verification completed successfully",
                "verificationAttempts", result.getVerificationAttempts(),
                "lastVerifiedAt", result.getLastVerifiedAt(),
                "failureReason", result.getFailureReason()
            ));
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid verification request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
                
        } catch (IllegalStateException e) {
            log.error("Invalid state transition: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
                
        } catch (Exception e) {
            log.error("Verification failed", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Verification failed: " + e.getMessage()));
        }
    }
    
    /**
     * Verify payment asynchronously
     */
    @PostMapping("/verify-async")
    public ResponseEntity<?> verifyPaymentAsync(@RequestBody Map<String, String> request) {
        try {
            String transactionIdStr = request.get("transactionId");
            if (transactionIdStr == null || transactionIdStr.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Transaction ID is required"));
            }
            
            UUID transactionId = UUID.fromString(transactionIdStr);
            log.info("Async verification request received for transaction: {}", transactionId);
            
            verificationService.verifyPaymentAsync(transactionId);
            
            return ResponseEntity.accepted()
                .body(Map.of(
                    "transactionId", transactionId.toString(),
                    "message", "Verification started asynchronously",
                    "status", "VERIFICATION_IN_PROGRESS"
                ));
                
        } catch (IllegalArgumentException e) {
            log.error("Invalid async verification request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
                
        } catch (Exception e) {
            log.error("Async verification failed to start", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to start verification: " + e.getMessage()));
        }
    }
    
    /**
     * Get detailed transaction status with state information
     */
    @GetMapping("/status")
    public ResponseEntity<?> getTransactionStatus(@RequestParam String transactionId) {
        try {
            UUID txnId = UUID.fromString(transactionId);
            log.info("Status request for transaction: {}", txnId);
            
            PaymentVerificationService.TransactionStatusData statusData = 
                verificationService.getTransactionStatus(txnId);
            
            Transaction transaction = statusData.getTransaction();
            
            Map<String, Object> response = new HashMap<>();
            response.put("transactionId", transaction.getId().toString());
            response.put("merchantId", transaction.getMerchantId());
            response.put("amount", transaction.getAmount());
            response.put("paymentMethod", transaction.getPaymentMethod());
            response.put("status", transaction.getStatus().toString());
            response.put("merchantTransactionId", transaction.getMerchantTransactionId());
            response.put("customerEmail", transaction.getCustomerEmail());
            response.put("failureReason", transaction.getFailureReason());
            response.put("upiTransactionId", transaction.getUpiTransactionId());
            response.put("callbackSent", transaction.getCallbackSent());
            response.put("verificationAttempts", transaction.getVerificationAttempts());
            response.put("lastVerifiedAt", transaction.getLastVerifiedAt());
            response.put("createdAt", transaction.getCreatedAt());
            response.put("updatedAt", transaction.getUpdatedAt());
            
            Map<String, Object> stateMetadata = new HashMap<>();
            stateMetadata.put("currentState", statusData.getCurrentState());
            stateMetadata.put("description", statusData.getDescription());
            stateMetadata.put("isTerminal", statusData.isTerminal());
            stateMetadata.put("allowsVerification", statusData.isAllowsVerification());
            stateMetadata.put("validNextStates", statusData.getValidNextStates());
            response.put("stateMetadata", stateMetadata);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid status request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
                
        } catch (Exception e) {
            log.error("Status request failed", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to get status: " + e.getMessage()));
        }
    }
    
    /**
     * Update transaction status manually (admin operation)
     */
    @PutMapping("/status")
    public ResponseEntity<?> updateTransactionStatus(@RequestBody Map<String, String> request) {
        try {
            String transactionIdStr = request.get("transactionId");
            String fromStatus = request.get("fromStatus");
            String toStatus = request.get("toStatus");
            String reason = request.get("reason");
            
            if (transactionIdStr == null || fromStatus == null || toStatus == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "transactionId, fromStatus, and toStatus are required"));
            }
            
            UUID transactionId = UUID.fromString(transactionIdStr);
            log.info("Manual status update request for transaction: {} from {} to {}", 
                    transactionId, fromStatus, toStatus);
            
            Transaction result = verificationService.updateTransactionStatus(
                transactionId, fromStatus, toStatus, reason);
            
            return ResponseEntity.ok(Map.of(
                "transactionId", result.getId().toString(),
                "status", result.getStatus().toString(),
                "message", "Status updated successfully",
                "updatedAt", result.getUpdatedAt()
            ));
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Invalid status update request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
                
        } catch (Exception e) {
            log.error("Status update failed", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Status update failed: " + e.getMessage()));
        }
    }
    
    /**
     * Get all transactions for a merchant with filtering
     */
    @GetMapping("/merchant/{merchantId}/transactions")
    public ResponseEntity<?> getMerchantTransactions(
            @PathVariable Long merchantId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod) {
        
        try {
            log.info("Fetching transactions for merchant: {} with filters - status: {}, paymentMethod: {}", 
                    merchantId, status, paymentMethod);
            
            // This would typically involve a repository method with filtering
            // For now, we'll return a simple response
            return ResponseEntity.ok(Map.of(
                "merchantId", merchantId,
                "message", "Transaction filtering not yet implemented",
                "filters", Map.of(
                    "status", status != null ? status : "all",
                    "paymentMethod", paymentMethod != null ? paymentMethod : "all"
                )
            ));
            
        } catch (Exception e) {
            log.error("Failed to fetch merchant transactions", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch transactions: " + e.getMessage()));
        }
    }
}