package com.upi.gateway.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "refunds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Refund {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "transaction_id", nullable = false)
    private UUID transactionId;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RefundStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "refund_type", nullable = false)
    private RefundType type;
    
    @Column(name = "reason")
    private String reason;
    
    @Column(name = "processed_by")
    private String processedBy;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    public enum RefundStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }
    
    public enum RefundType {
        FULL, PARTIAL
    }
}
