package com.upi.gateway.backend.service;

import com.upi.gateway.backend.dto.PaymentInitiateRequest;
import com.upi.gateway.backend.dto.PaymentInitiateResponse;
import com.upi.gateway.backend.dto.TransactionStatusResponse;
import com.upi.gateway.backend.factory.PaymentProcessorFactory;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.TransactionRepository;
import com.upi.gateway.backend.strategy.PaymentProcessor;
import com.upi.gateway.backend.strategy.PaymentResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    
    private final TransactionRepository transactionRepository;
    private final PaymentProcessorFactory processorFactory;
    
    @Transactional
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) {
        log.info("Initiating payment for merchant: {} with method: {}", 
                request.getMerchantId(), request.getPaymentMethod());
        
        // Validate payment method
        Optional<PaymentProcessor> processorOpt = processorFactory.getProcessorByMethod(request.getPaymentMethod());
        if (processorOpt.isEmpty()) {
            throw new IllegalArgumentException("Unsupported payment method: " + request.getPaymentMethod());
        }
        
        // Create transaction with CREATED status
        Transaction transaction = Transaction.builder()
                .merchantId(request.getMerchantId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod().toUpperCase())
                .status(Transaction.TransactionStatus.CREATED)
                .merchantTransactionId(request.getMerchantTransactionId())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .build();
        
        transaction = transactionRepository.save(transaction);
        log.info("Created transaction with ID: {}", transaction.getId());
        
        // Update status to INITIATED
        transaction.setStatus(Transaction.TransactionStatus.INITIATED);
        transaction = transactionRepository.save(transaction);
        
        // Process payment asynchronously
        PaymentProcessor processor = processorOpt.get();
        processPaymentAsync(transaction, processor);
        
        return PaymentInitiateResponse.from(transaction, "Payment initiated successfully");
    }
    
    private void processPaymentAsync(Transaction transaction, PaymentProcessor processor) {
        // Update status to PROCESSING
        transaction.setStatus(Transaction.TransactionStatus.PROCESSING);
        transactionRepository.save(transaction);
        
        // Process payment
        processor.process(transaction)
                .thenAccept(result -> updateTransactionResult(transaction.getId(), result))
                .exceptionally(throwable -> {
                    log.error("Payment processing failed for transaction: {}", transaction.getId(), throwable);
                    PaymentResult failureResult = PaymentResult.failure("Processing error: " + throwable.getMessage());
                    updateTransactionResult(transaction.getId(), failureResult);
                    return null;
                });
    }
    
    @Transactional
    public void updateTransactionResult(UUID transactionId, PaymentResult result) {
        Optional<Transaction> transactionOpt = transactionRepository.findById(transactionId);
        if (transactionOpt.isPresent()) {
            Transaction transaction = transactionOpt.get();
            transaction.setStatus(result.getStatus());
            
            if (result.isSuccess() && result.getTransactionId() != null) {
                transaction.setUpiTransactionId(result.getTransactionId());
            }
            
            if (!result.isSuccess() && result.getFailureReason() != null) {
                transaction.setFailureReason(result.getFailureReason());
            }
            
            transactionRepository.save(transaction);
            log.info("Updated transaction {} with status: {}", transactionId, result.getStatus());
        }
    }
    
    public Optional<TransactionStatusResponse> getTransactionStatus(UUID transactionId) {
        return transactionRepository.findById(transactionId)
                .map(TransactionStatusResponse::from);
    }
    
    public List<TransactionStatusResponse> getMerchantTransactions(Long merchantId) {
        return transactionRepository.findByMerchantIdOrderByCreatedAtDesc(merchantId)
                .stream()
                .map(TransactionStatusResponse::from)
                .toList();
    }
    
    public List<String> getAvailablePaymentMethods() {
        return processorFactory.getAvailablePaymentMethods();
    }
}