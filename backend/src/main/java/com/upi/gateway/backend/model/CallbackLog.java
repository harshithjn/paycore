package com.upi.gateway.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "callback_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallbackLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "transaction_id", nullable = false)
    private UUID transactionId;
    
    @Column(name = "status_sent", nullable = false)
    private String statusSent;
    
    @Column(name = "callback_url")
    private String callbackUrl;
    
    @Column(name = "response_code")
    private Integer responseCode;
    
    @Column(name = "response_body", columnDefinition = "TEXT")
    private String responseBody;
    
    @Column(name = "retry_count")
    @Builder.Default
    private Integer retryCount = 0;
    
    @CreationTimestamp
    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}