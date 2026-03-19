package com.upi.gateway.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Junction table linking settlements to transactions
 * Ensures idempotency - prevents duplicate settlements
 */
@Entity
@Table(name = "settlement_transactions", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"transaction_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "settlement_id", nullable = false)
    private UUID settlementId;
    
    @Column(name = "transaction_id", nullable = false, unique = true)
    private UUID transactionId;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
