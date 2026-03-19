package com.upi.gateway.backend.service;

import com.upi.gateway.backend.dto.*;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentGatewayService {
    
    private final TransactionRepository transactionRepository;
    private final PaymentService paymentService;
    
    private static final String PAYMENT_BASE_URL = "http://localhost:5173/payment";
    
    /**
     * Generate payment link and QR code for transaction
     */
    public PaymentLinkResponse generatePaymentLink(UUID transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
        
        if (transaction.getStatus() != Transaction.TransactionStatus.CREATED) {
            throw new IllegalStateException("Payment link can only be generated for CREATED transactions");
        }
        
        String paymentLink = String.format("%s/%s", PAYMENT_BASE_URL, transactionId);
        String qrCodeData = generateUPIQRString(transaction);
        
        log.info("Generated payment link for transaction: {}", transactionId);
        
        return PaymentLinkResponse.builder()
                .transactionId(transactionId)
                .paymentLink(paymentLink)
                .qrCodeData(qrCodeData)
                .amount(transaction.getAmount().doubleValue())
                .status(transaction.getStatus().name())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .message("Payment link generated successfully")
                .build();
    }
    
    /**
     * Process card payment with CVV validation
     */
    @Transactional
    public PaymentInitiateResponse processCardPayment(CardPaymentRequest request) {
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
        
        // CVV validation - reject if CVV is 111
        if ("111".equals(request.getCvv())) {
            transaction.setStatus(Transaction.TransactionStatus.FAILED);
            transaction.setPaymentMethod("CARD");
            transaction.setFailureReason("Card declined - Invalid CVV");
            transactionRepository.save(transaction);
            paymentService.notifyObservers(transaction);
            
            log.warn("Card payment declined for transaction: {} - CVV 111", transaction.getId());
            
            return PaymentInitiateResponse.builder()
                    .transactionId(transaction.getId())
                    .merchantId(transaction.getMerchantId())
                    .amount(transaction.getAmount())
                    .paymentMethod(transaction.getPaymentMethod())
                    .status(Transaction.TransactionStatus.FAILED)
                    .message("Card declined - Invalid CVV")
                    .createdAt(transaction.getCreatedAt())
                    .build();
        }
        
        // Simulate card processing
        transaction.setStatus(Transaction.TransactionStatus.PROCESSING);
        transactionRepository.save(transaction);
        
        // Simulate success after processing
        transaction.setStatus(Transaction.TransactionStatus.SUCCESS);
        transaction.setPaymentMethod("CARD");
        transaction.setUpiTransactionId("CARD" + System.currentTimeMillis());
        transactionRepository.save(transaction);
        paymentService.notifyObservers(transaction);
        
        log.info("Card payment successful for transaction: {}", transaction.getId());
        
        return PaymentInitiateResponse.builder()
                .transactionId(transaction.getId())
                .merchantId(transaction.getMerchantId())
                .amount(transaction.getAmount())
                .paymentMethod(transaction.getPaymentMethod())
                .status(Transaction.TransactionStatus.SUCCESS)
                .message("Payment successful")
                .createdAt(transaction.getCreatedAt())
                .build();
    }
    
    /**
     * Process UPI payment
     */
    @Transactional
    public PaymentInitiateResponse processUPIPayment(UPIPaymentRequest request) {
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
        
        // Simulate UPI processing
        transaction.setStatus(Transaction.TransactionStatus.PROCESSING);
        transactionRepository.save(transaction);
        
        // Simulate success
        transaction.setStatus(Transaction.TransactionStatus.SUCCESS);
        transaction.setPaymentMethod("UPI");
        transaction.setUpiTransactionId("UPI" + System.currentTimeMillis());
        transactionRepository.save(transaction);
        paymentService.notifyObservers(transaction);
        
        log.info("UPI payment successful for transaction: {}", transaction.getId());
        
        return PaymentInitiateResponse.builder()
                .transactionId(transaction.getId())
                .merchantId(transaction.getMerchantId())
                .amount(transaction.getAmount())
                .paymentMethod(transaction.getPaymentMethod())
                .status(Transaction.TransactionStatus.SUCCESS)
                .message("Payment successful")
                .createdAt(transaction.getCreatedAt())
                .build();
    }
    
    /**
     * Generate UPI QR code string
     */
    private String generateUPIQRString(Transaction transaction) {
        return String.format(
            "upi://pay?pa=merchant@upi&pn=PayCore&am=%.2f&tr=%s&tn=Payment",
            transaction.getAmount(),
            transaction.getId()
        );
    }
}
