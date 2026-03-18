package com.upi.gateway.backend.controller;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.service.EnhancedTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Controller to demonstrate the Observer Pattern callback system
 * Shows how transaction status changes trigger webhook notifications
 */
@RestController
@RequestMapping("/api/callback-demo")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CallbackDemoController {
    
    private final EnhancedTransactionService transactionService;
    
    /**
     * Update transaction status manually to trigger callbacks
     */
    @PutMapping("/update-status")
    public ResponseEntity<?> updateTransactionStatus(@RequestBody Map<String, String> request) {
        try {
            String transactionIdStr = request.get("transactionId");
            String statusStr = request.get("status");
            String failureReason = request.get("failureReason");
            
            if (transactionIdStr == null || statusStr == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "transactionId and status are required"));
            }
            
            UUID transactionId = UUID.fromString(transactionIdStr);
            Transaction.TransactionStatus status = Transaction.TransactionStatus.valueOf(statusStr.toUpperCase());
            
            log.info("Manual status update request: {} -> {}", transactionId, status);
            
            Transaction updatedTransaction;
            if (failureReason != null && !failureReason.trim().isEmpty()) {
                updatedTransaction = transactionService.updateTransactionStatus(transactionId, status, failureReason);
            } else {
                updatedTransaction = transactionService.updateTransactionStatus(transactionId, status);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("transactionId", updatedTransaction.getId().toString());
            response.put("status", updatedTransaction.getStatus().toString());
            response.put("message", "Status updated successfully - observers notified");
            response.put("observerCount", transactionService.getObserverCount());
            response.put("observerTypes", transactionService.getObserverTypes());
            response.put("updatedAt", updatedTransaction.getUpdatedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
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
     * Simulate complete transaction processing with multiple status changes
     */
    @PostMapping("/simulate-processing")
    public ResponseEntity<?> simulateTransactionProcessing(@RequestBody Map<String, String> request) {
        try {
            String transactionIdStr = request.get("transactionId");
            
            if (transactionIdStr == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "transactionId is required"));
            }
            
            UUID transactionId = UUID.fromString(transactionIdStr);
            
            log.info("Starting simulated processing for transaction: {}", transactionId);
            
            // Start async processing
            CompletableFuture<Transaction> future = transactionService.processTransactionWithNotifications(transactionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("transactionId", transactionId.toString());
            response.put("message", "Transaction processing started - multiple callbacks will be triggered");
            response.put("observerCount", transactionService.getObserverCount());
            response.put("observerTypes", transactionService.getObserverTypes());
            response.put("status", "PROCESSING_STARTED");
            
            return ResponseEntity.accepted().body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid simulation request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
                
        } catch (Exception e) {
            log.error("Simulation failed", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Simulation failed: " + e.getMessage()));
        }
    }
    
    /**
     * Get observer information
     */
    @GetMapping("/observers")
    public ResponseEntity<?> getObserverInfo() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("observerCount", transactionService.getObserverCount());
            response.put("observerTypes", transactionService.getObserverTypes());
            response.put("message", "Observer Pattern implementation active");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to get observer info", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to get observer info: " + e.getMessage()));
        }
    }
    
    /**
     * Test webhook payload format
     */
    @GetMapping("/webhook-payload-sample")
    public ResponseEntity<?> getWebhookPayloadSample() {
        Map<String, Object> samplePayload = new HashMap<>();
        samplePayload.put("transactionId", "550e8400-e29b-41d4-a716-446655440000");
        samplePayload.put("merchantTransactionId", "ORDER_12345");
        samplePayload.put("status", "SUCCESS");
        samplePayload.put("amount", 500.00);
        samplePayload.put("paymentMethod", "UPI");
        samplePayload.put("timestamp", "2024-01-15T10:30:00");
        samplePayload.put("failureReason", null);
        samplePayload.put("upiTransactionId", "UPI12345678");
        samplePayload.put("webhookVersion", "2.0");
        samplePayload.put("merchantId", 1);
        
        Map<String, Object> response = new HashMap<>();
        response.put("samplePayload", samplePayload);
        response.put("description", "This is the payload format sent to merchant webhook URLs");
        response.put("contentType", "application/json");
        response.put("method", "POST");
        
        return ResponseEntity.ok(response);
    }
}