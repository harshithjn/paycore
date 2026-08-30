package com.upi.gateway.backend.controller;

import com.upi.gateway.backend.dto.*;
import com.upi.gateway.backend.service.PaymentGatewayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/gateway")
@RequiredArgsConstructor
@Slf4j
public class PaymentGatewayController {

    private final PaymentGatewayService gatewayService;

    @PostMapping("/generate-link/{transactionId}")
    public ResponseEntity<?> generatePaymentLink(@PathVariable UUID transactionId) {
        try {
            PaymentLinkResponse response = gatewayService.generatePaymentLink(transactionId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/pay/card")
    public ResponseEntity<?> processCardPayment(@Valid @RequestBody CardPaymentRequest request) {
        try {
            PaymentInitiateResponse response = gatewayService.processCardPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Card payment error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/pay/upi")
    public ResponseEntity<?> processUPIPayment(@Valid @RequestBody UPIPaymentRequest request) {
        try {
            PaymentInitiateResponse response = gatewayService.processUPIPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("UPI payment error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
