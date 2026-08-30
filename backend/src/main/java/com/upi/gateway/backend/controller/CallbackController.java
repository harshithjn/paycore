package com.upi.gateway.backend.controller;

import com.upi.gateway.backend.model.CallbackLog;
import com.upi.gateway.backend.repository.CallbackLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/callbacks")
@RequiredArgsConstructor
@Slf4j
public class CallbackController {

    private final CallbackLogRepository callbackLogRepository;

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<List<CallbackLog>> getTransactionCallbacks(@PathVariable UUID transactionId) {
        log.info("Fetching callback logs for transaction: {}", transactionId);

        List<CallbackLog> callbacks = callbackLogRepository.findByTransactionIdOrderByTimestampDesc(transactionId);
        return ResponseEntity.ok(callbacks);
    }

    @GetMapping("/failed")
    public ResponseEntity<List<CallbackLog>> getFailedCallbacks() {
        log.info("Fetching failed callback logs");

        List<CallbackLog> failedCallbacks = callbackLogRepository.findFailedCallbacks();
        return ResponseEntity.ok(failedCallbacks);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CallbackLog>> getCallbacksByStatus(@PathVariable String status) {
        log.info("Fetching callback logs for status: {}", status);

        List<CallbackLog> callbacks = callbackLogRepository.findByStatusSentOrderByTimestampDesc(status);
        return ResponseEntity.ok(callbacks);
    }

    @GetMapping("/transaction/{transactionId}/count")
    public ResponseEntity<Long> getCallbackCount(@PathVariable UUID transactionId) {
        log.info("Fetching callback count for transaction: {}", transactionId);

        Long count = callbackLogRepository.countCallbackAttempts(transactionId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CallbackLog>> getAllCallbacks() {
        log.info("Fetching all callback logs");

        List<CallbackLog> callbacks = callbackLogRepository.findAll();
        return ResponseEntity.ok(callbacks);
    }
}
