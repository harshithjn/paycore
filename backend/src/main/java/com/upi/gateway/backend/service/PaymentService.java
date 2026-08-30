package com.upi.gateway.backend.service;

import com.upi.gateway.backend.dto.PaymentInitiateRequest;
import com.upi.gateway.backend.dto.PaymentInitiateResponse;
import com.upi.gateway.backend.dto.TransactionStatusResponse;
import com.upi.gateway.backend.factory.PaymentProcessorFactory;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.observer.TransactionObserver;
import com.upi.gateway.backend.observer.TransactionSubject;
import com.upi.gateway.backend.repository.TransactionRepository;
import com.upi.gateway.backend.strategy.PaymentProcessor;
import com.upi.gateway.backend.strategy.PaymentResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService implements TransactionSubject {

    private final TransactionRepository transactionRepository;
    private final PaymentProcessorFactory processorFactory;
    private final List<TransactionObserver> observers = new ArrayList<>();

    @Override
    public void registerObserver(TransactionObserver observer) {
        observers.add(observer);
        log.info("Registered observer: {}", observer.getType());
    }

    @Override
    public void removeObserver(TransactionObserver observer) {
        observers.remove(observer);
        log.info("Removed observer: {}", observer.getType());
    }

    @Override
    public void notifyObservers(Transaction transaction) {
        log.info("Notifying {} observers for transaction {} with status {}",
                observers.size(), transaction.getId(), transaction.getStatus());

        for (TransactionObserver observer : observers) {
            try {
                observer.update(transaction);
            } catch (Exception e) {
                log.error("Error notifying observer {}: {}", observer.getType(), e.getMessage(), e);
            }
        }
    }

    @Transactional
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) {
        log.info("Initiating payment for merchant: {} with method: {}",
                request.getMerchantId(), request.getPaymentMethod());

        Optional<PaymentProcessor> processorOpt = processorFactory.getProcessorByMethod(request.getPaymentMethod());
        if (processorOpt.isEmpty()) {
            throw new IllegalArgumentException("Unsupported payment method: " + request.getPaymentMethod());
        }

        Transaction transaction = Transaction.builder()
                .merchantId(request.getMerchantId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod().toUpperCase())
                .status(Transaction.TransactionStatus.CREATED)
                .merchantTransactionId(request.getMerchantTransactionId())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .callbackUrl(request.getCallbackUrl())
                .build();

        transaction = transactionRepository.save(transaction);
        log.info("Created transaction with ID: {}", transaction.getId());

        notifyObservers(transaction);

        transaction.setStatus(Transaction.TransactionStatus.INITIATED);
        transaction = transactionRepository.save(transaction);

        notifyObservers(transaction);
        return PaymentInitiateResponse.from(transaction, "Payment initiated successfully");
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

            transaction = transactionRepository.save(transaction);
            log.info("Updated transaction {} with status: {}", transactionId, result.getStatus());

            notifyObservers(transaction);
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
