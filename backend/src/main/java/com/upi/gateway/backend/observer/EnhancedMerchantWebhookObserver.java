package com.upi.gateway.backend.observer;

import com.upi.gateway.backend.model.CallbackLog;
import com.upi.gateway.backend.model.Merchant;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.CallbackLogRepository;
import com.upi.gateway.backend.repository.MerchantRepository;
import com.upi.gateway.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Enhanced Merchant Webhook Observer using WebClient
 * Implements both CallbackObserver and TransactionObserver for compatibility
 * Provides modern reactive HTTP client with better error handling
 */
@Component("enhancedMerchantWebhookObserver")
@RequiredArgsConstructor
@Slf4j
public class EnhancedMerchantWebhookObserver implements CallbackObserver, TransactionObserver {
    
    private final MerchantRepository merchantRepository;
    private final CallbackLogRepository callbackLogRepository;
    private final TransactionRepository transactionRepository;
    private final WebClient webClient;
    
    private static final int MAX_RETRIES = 3;
    private static final Duration TIMEOUT = Duration.ofSeconds(10);
    private static final Duration RETRY_DELAY = Duration.ofSeconds(1);

    @Override
    @Async
    public void update(Transaction transaction) {
        log.info("EnhancedMerchantWebhookObserver: Processing transaction {} with status {}", 
                transaction.getId(), transaction.getStatus());
        
        CompletableFuture.runAsync(() -> {
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
                
                // Send webhook using WebClient with reactive approach
                sendWebhookReactive(transaction, webhookUrl);
                
            } catch (Exception e) {
                log.error("Error in EnhancedMerchantWebhookObserver for transaction {}: {}", 
                        transaction.getId(), e.getMessage(), e);
            }
        });
    }
    
    private void sendWebhookReactive(Transaction transaction, String webhookUrl) {
        Map<String, Object> payload = createWebhookPayload(transaction);
        
        log.info("Sending reactive webhook to {} for transaction {}", webhookUrl, transaction.getId());
        
        webClient.post()
                .uri(webhookUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .header("User-Agent", "PayCore-Gateway/2.0")
                .header("X-Webhook-Source", "PayCore")
                .header("X-Transaction-Id", transaction.getId().toString())
                .bodyValue(payload)
                .retrieve()
                .toBodilessEntity()
                .timeout(TIMEOUT)
                .retryWhen(Retry.backoff(MAX_RETRIES, RETRY_DELAY)
                    .filter(throwable -> !(throwable instanceof WebClientResponseException.BadRequest)))
                .doOnSuccess(response -> {
                    log.info("Webhook sent successfully to {} for transaction {} - Status: {}", 
                            webhookUrl, transaction.getId(), response.getStatusCode());
                    
                    // Log successful callback
                    logCallback(transaction.getId(), webhookUrl, payload, 
                              response.getStatusCode().value(), "Success", 0);
                    
                    // Update transaction callback status
                    updateCallbackStatus(transaction.getId(), true);
                })
                .doOnError(error -> {
                    log.error("Webhook failed for transaction {}: {}", transaction.getId(), error.getMessage());
                    
                    int responseCode = 0;
                    String responseBody = error.getMessage();
                    
                    if (error instanceof WebClientResponseException) {
                        WebClientResponseException webEx = (WebClientResponseException) error;
                        responseCode = webEx.getRawStatusCode();
                        responseBody = webEx.getResponseBodyAsString();
                    }
                    
                    // Log failed callback
                    logCallback(transaction.getId(), webhookUrl, payload, 
                              responseCode, responseBody, MAX_RETRIES);
                    
                    // Update transaction callback status
                    updateCallbackStatus(transaction.getId(), false);
                })
                .subscribe();
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
        
        // Additional metadata
        payload.put("webhookVersion", "2.0");
        payload.put("merchantId", transaction.getMerchantId());
        payload.put("createdAt", transaction.getCreatedAt().toString());
        payload.put("updatedAt", transaction.getUpdatedAt().toString());
        
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
            log.debug("Logged callback for transaction {} with response code {}", transactionId, responseCode);
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
                log.debug("Updated callback status for transaction {} to {}", transactionId, success);
            }
        } catch (Exception e) {
            log.error("Error updating callback status: {}", e.getMessage());
        }
    }
    
    @Override
    public String getType() {
        return "EnhancedMerchantWebhookObserver";
    }
}