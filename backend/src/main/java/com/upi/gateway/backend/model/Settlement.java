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
@Table(name = "settlements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Settlement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "merchant_id", nullable = false)
    private Long merchantId;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SettlementStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "settlement_type", nullable = false)
    private SettlementType type;
    
    @Column(name = "transaction_count")
    private Integer transactionCount;
    
    @Column(name = "period_start")
    private LocalDateTime periodStart;
    
    @Column(name = "period_end")
    private LocalDateTime periodEnd;
    
    @Column(name = "reference_number", unique = true)
    private String referenceNumber;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    public enum SettlementStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }
    
    public enum SettlementType {
        DAILY, WEEKLY, MONTHLY, MANUAL
    }
}
