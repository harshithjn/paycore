package com.upi.gateway.backend.service;

import com.upi.gateway.backend.model.ApiRequestLog;
import com.upi.gateway.backend.model.PaymentLink;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.ApiRequestLogRepository;
import com.upi.gateway.backend.repository.PaymentLinkRepository;
import com.upi.gateway.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentLinkService {

    private final PaymentLinkRepository paymentLinkRepository;
    private final TransactionRepository transactionRepository; 
    private final ApiRequestLogRepository apiRequestLogRepository; 

    public PaymentLink createLink(Long merchantId, String title, String description, BigDecimal amount, boolean isReusable) {
        String linkCode = "pl_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        PaymentLink link = PaymentLink.builder()
                .merchantId(merchantId)
                .linkCode(linkCode)
                .title(title)
                .description(description)
                .amount(amount)
                .isReusable(isReusable)
                .status(PaymentLink.LinkStatus.ACTIVE)
                .build();

        PaymentLink saved = paymentLinkRepository.save(link);
        log.info("Created payment link {} for merchant {}", linkCode, merchantId);
        return saved;
    }

    public PaymentLink getLinkByCode(String linkCode) {
        return paymentLinkRepository.findByLinkCode(linkCode)
                .orElseThrow(() -> new RuntimeException("Payment link not found"));
    }

    public List<PaymentLink> getMerchantLinks(Long merchantId) {
        return paymentLinkRepository.findByMerchantIdOrderByCreatedAtDesc(merchantId);
    }

    @Transactional
    public Transaction processPayment(String linkCode, String paymentMethod, String customerEmail, String customerPhone) {
        PaymentLink link = getLinkByCode(linkCode);

        if (link.getStatus() != PaymentLink.LinkStatus.ACTIVE) {
            throw new RuntimeException("This payment link is no longer active");
        }

        if (!link.getIsReusable() && link.getPaymentCount() > 0) {
            throw new RuntimeException("This payment link has already been used");
        }

        // Create the transaction
        Transaction transaction = Transaction.builder()
                .merchantId(link.getMerchantId())
                .amount(link.getAmount())
                .status(Transaction.TransactionStatus.INITIATED)
                .paymentMethod(paymentMethod != null ? paymentMethod : "LINK")
                .customerEmail(customerEmail)
                .customerPhone(customerPhone)
                .merchantTransactionId("link_" + link.getLinkCode())
                .build();

        Transaction saved = transactionRepository.save(transaction);

        // Simulate payment processing — mark as SUCCESS
        saved.setStatus(Transaction.TransactionStatus.SUCCESS);
        saved.setPaymentMethod(paymentMethod != null ? paymentMethod.toUpperCase() : "LINK");
        transactionRepository.save(saved);

        // Update link counters
        link.setPaymentCount(link.getPaymentCount() + 1);
        link.setTotalCollected(link.getTotalCollected().add(link.getAmount()));
        paymentLinkRepository.save(link);

        log.info("Payment processed via link {} — txn {}", linkCode, saved.getId());
        return saved;
    }

    @Transactional
    public PaymentLink toggleStatus(String linkCode, Long merchantId) {
        PaymentLink link = getLinkByCode(linkCode);

        if (!link.getMerchantId().equals(merchantId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (link.getStatus() == PaymentLink.LinkStatus.ACTIVE) {
            link.setStatus(PaymentLink.LinkStatus.INACTIVE);
        } else {
            link.setStatus(PaymentLink.LinkStatus.ACTIVE);
        }

        return paymentLinkRepository.save(link);
    }

    // API Logging
    public void logApiRequest(Long merchantId, String apiKey, String method, String endpoint,
                               Integer statusCode, String requestBody, String responseSummary, String ipAddress) {
        ApiRequestLog logEntry = ApiRequestLog.builder()
                .merchantId(merchantId)
                .apiKey(apiKey != null ? apiKey.substring(0, Math.min(apiKey.length(), 12)) + "..." : null)
                .method(method)
                .endpoint(endpoint)
                .statusCode(statusCode)
                .requestBody(requestBody)
                .responseSummary(responseSummary)
                .ipAddress(ipAddress)
                .build();

        apiRequestLogRepository.save(logEntry);
    }

    public List<ApiRequestLog> getApiLogs(Long merchantId) {
        return apiRequestLogRepository.findTop50ByMerchantIdOrderByCreatedAtDesc(merchantId);
    }
}
