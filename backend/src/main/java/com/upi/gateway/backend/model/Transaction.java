package com.upi.gateway.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "merchant_id", nullable = false)
    private Long merchantId;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;
    
    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;
    
    @Column(name = "merchant_transaction_id")
    private String merchantTransactionId;
    
    @Column(name = "customer_email")
    private String customerEmail;
    
    @Column(name = "customer_phone")
    private String customerPhone;
    
    @Column(name = "failure_reason")
    private String failureReason;
    
    @Column(name = "upi_transaction_id")
    private String upiTransactionId;
    
    @Column(name = "callback_url")
    private String callbackUrl;
    
    @Column(name = "callback_sent")
    @Builder.Default
    private Boolean callbackSent = false;
    
    @Column(name = "verification_attempts")
    @Builder.Default
    private Integer verificationAttempts = 0;
    
    @Column(name = "last_verified_at")
    private LocalDateTime lastVerifiedAt;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum TransactionStatus {
        CREATED, INITIATED, PROCESSING, SUCCESS, FAILED, REFUNDED, SETTLED
    }
}