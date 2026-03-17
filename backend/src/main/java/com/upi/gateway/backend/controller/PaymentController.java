package com.upi.gateway.backend.controller;

import com.upi.gateway.backend.dto.PaymentInitiateRequest;
import com.upi.gateway.backend.dto.PaymentInitiateResponse;
import com.upi.gateway.backend.dto.TransactionStatusResponse;
import com.upi.gateway.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @PostMapping("/initiate")
    public ResponseEntity<PaymentInitiateResponse> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest request) {
        try {
            log.info("Received payment initiation request for merchant: {}", request.getMerchantId());
            PaymentInitiateResponse response = paymentService.initiatePayment(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid payment request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error initiating payment", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/status/{transactionId}")
    public ResponseEntity<TransactionStatusResponse> getTransactionStatus(
            @PathVariable UUID transactionId) {
        return paymentService.getTransactionStatus(transactionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/merchant/{merchantId}/transactions")
    public ResponseEntity<List<TransactionStatusResponse>> getMerchantTransactions(
            @PathVariable Long merchantId) {
        List<TransactionStatusResponse> transactions = paymentService.getMerchantTransactions(merchantId);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/methods")
    public ResponseEntity<List<String>> getAvailablePaymentMethods() {
        List<String> methods = paymentService.getAvailablePaymentMethods();
        return ResponseEntity.ok(methods);
    }
}