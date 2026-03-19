package com.upi.gateway.backend.controller;

import com.upi.gateway.backend.dto.RefundRequest;
import com.upi.gateway.backend.dto.RefundResponse;
import com.upi.gateway.backend.service.RefundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RefundController {
    
    private final RefundService refundService;
    
    /**
     * POST /api/refund - Process a refund request
     */
    @PostMapping("/refund")
    public ResponseEntity<?> processRefund(@Valid @RequestBody RefundRequest request) {
        try {
            log.info("Received refund request for transaction: {}", request.getTransactionId());
            RefundResponse response = refundService.processRefund(request);
            
            if ("FAILED".equals(response.getStatus())) {
                return ResponseEntity.badRequest().body(response);
            }
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Refund validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    RefundResponse.builder()
                            .message(e.getMessage())
                            .status("FAILED")
                            .build()
            );
        } catch (Exception e) {
            log.error("Error processing refund", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    RefundResponse.builder()
                            .message("Internal server error: " + e.getMessage())
                            .status("FAILED")
                            .build()
            );
        }
    }
    
    /**
     * GET /api/refunds?transactionId={id} - Get refunds for a transaction
     */
    @GetMapping("/refunds")
    public ResponseEntity<List<RefundResponse>> getRefunds(
            @RequestParam(required = false) UUID transactionId) {
        
        if (transactionId != null) {
            List<RefundResponse> refunds = refundService.getRefundsByTransaction(transactionId);
            return ResponseEntity.ok(refunds);
        }
        
        return ResponseEntity.badRequest().build();
    }
    
    /**
     * GET /api/refunds/remaining/{transactionId} - Get remaining refundable amount
     */
    @GetMapping("/refunds/remaining/{transactionId}")
    public ResponseEntity<?> getRemainingRefundableAmount(@PathVariable UUID transactionId) {
        try {
            BigDecimal remaining = refundService.getRemainingRefundableAmount(transactionId);
            return ResponseEntity.ok(new RemainingAmountResponse(transactionId, remaining.doubleValue()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Inner DTO for remaining amount response
    private record RemainingAmountResponse(UUID transactionId, Double remainingAmount) {}
}
