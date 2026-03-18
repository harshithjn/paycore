package com.upi.gateway.backend.observer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.upi.gateway.backend.model.CallbackLog;
import com.upi.gateway.backend.model.Merchant;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.CallbackLogRepository;
import com.upi.gateway.backend.repository.MerchantRepository;
import com.upi.gateway.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Concrete Observer for Merchant Webhook Notifications
 * Handles sending webhook notifications to merchant endpoints
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MerchantWebhookObserver implements TransactionObserver {
    
    private final MerchantRepository merchantRepository;
    private final CallbackLogRepository callbackLogRepository;
    private final TransactionRepository transactionRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000;

    @Override
    @Async
    public void update(Transaction transaction) {
        log.info("MerchantWebhookObserver: Processing transaction {} with status {}", 
                transaction.getId(), transaction.getStatus());
        
        try {
            Optional<Merchant> merchantOpt = merchantRepository.findById(transaction.getMerchantId());
            
            if (merchantOpt.isEmpty()) {
                log.warn("Merchant not found for transaction {}", transaction.getId());
                return;
            }
            
            Merchant merchant = merchantOpt.get();
            String webhookUrl = merchant.getWebhookUrl();
            
            if (webhookUrl == null || webhookUrl.trim().isEmpty()) {
                log.info("No webhook URL configured for merchant {}", merchant.getId());
                return;
            }
            
            // Send webhook with retry mechanism
            sendWebhookWithRetry(transaction, webhookUrl, 0);
            
        } catch (Exception e) {
            log.error("Error in MerchantWebhookObserver for transaction {}: {}", 
                    transaction.getId(), e.getMessage(), e);
        }
    }
    
    private void sendWebhookWithRetry(Transaction transaction, String webhookUrl, int retryCount) {
        CompletableFuture.runAsync(() -> {
            try {
                Map<String, Object> payload = createWebhookPayload(transaction);
                
                log.info("Sending webhook to {} for transaction {} (attempt {})", 
                        webhookUrl, transaction.getId(), retryCount + 1);
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("User-Agent", "PayCore-Gateway/1.0");
                
                HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
                
                ResponseEntity<String> response = restTemplate.exchange(
                    webhookUrl, 
                    HttpMethod.POST, 
                    request, 
                    String.class
                );
                
                // Log successful callback
                logCallback(transaction.getId(), webhookUrl, payload, 
                          response.getStatusCodeValue(), response.getBody(), retryCount);
                
                // Update transaction callback status
                updateCallbackStatus(transaction.getId(), true);
                
                log.info("Webhook sent successfully to {} for transaction {}", 
                        webhookUrl, transaction.getId());
                
            } catch (Exception e) {
                log.error("Webhook failed for transaction {} (attempt {}): {}", 
                        transaction.getId(), retryCount + 1, e.getMessage());
                
                // Log failed callback
                Map<String, Object> payload = createWebhookPayload(transaction);
                int responseCode = 0;
                String responseBody = e.getMessage();
                
                if (e instanceof org.springframework.web.client.HttpStatusCodeException) {
                    org.springframework.web.client.HttpStatusCodeException httpEx = 
                        (org.springframework.web.client.HttpStatusCodeException) e;
                    responseCode = httpEx.getRawStatusCode();
                    responseBody = httpEx.getResponseBodyAsString();
                }
                
                logCallback(transaction.getId(), webhookUrl, payload, 
                          responseCode, responseBody, retryCount);
                
                // Retry if we haven't exceeded max retries
                if (retryCount < MAX_RETRIES) {
                    long delay = RETRY_DELAY_MS * (long) Math.pow(2, retryCount); // Exponential backoff
                    log.info("Retrying webhook in {}ms...", delay);
                    
                    try {
                        Thread.sleep(delay);
                        sendWebhookWithRetry(transaction, webhookUrl, retryCount + 1);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error("Webhook retry interrupted for transaction {}", transaction.getId());
                    }
                } else {
                    log.error("Max retries exceeded for webhook to {} for transaction {}", 
                            webhookUrl, transaction.getId());
                    updateCallbackStatus(transaction.getId(), false);
                }
            }
        });
    }
    
    private Map<String, Object> createWebhookPayload(Transaction transaction) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("transactionId", transaction.getId().toString());
        payload.put("merchantTransactionId", transaction.getMerchantTransactionId());
        payload.put("status", transaction.getStatus().toString());
        payload.put("amount", transaction.getAmount());
        payload.put("paymentMethod", transaction.getPaymentMethod());
        payload.put("timestamp", LocalDateTime.now().toString());
        payload.put("failureReason", transaction.getFailureReason());
        payload.put("upiTransactionId", transaction.getUpiTransactionId());
        return payload;
    }
    
    private void logCallback(UUID transactionId, String webhookUrl, Map<String, Object> payload,
                           int responseCode, String responseBody, int retryCount) {
        try {
            CallbackLog callbackLog = CallbackLog.builder()
                .transactionId(transactionId)
                .statusSent(payload.get("status").toString())
                .callbackUrl(webhookUrl)
                .responseCode(responseCode)
                .responseBody(responseBody)
                .retryCount(retryCount)
                .build();
                
            callbackLogRepository.save(callbackLog);
        } catch (Exception e) {
            log.error("Error logging callback: {}", e.getMessage());
        }
    }
    
    private void updateCallbackStatus(UUID transactionId, boolean success) {
        try {
            Optional<Transaction> transactionOpt = transactionRepository.findById(transactionId);
            if (transactionOpt.isPresent()) {
                Transaction transaction = transactionOpt.get();
                transaction.setCallbackSent(success);
                transactionRepository.save(transaction);
            }
        } catch (Exception e) {
            log.error("Error updating callback status: {}", e.getMessage());
        }
    }
    
    @Override
    public String getType() {
        return "MerchantWebhookObserver";
    }
}