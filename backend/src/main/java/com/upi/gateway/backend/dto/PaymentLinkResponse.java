package com.upi.gateway.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentLinkResponse {

    private UUID transactionId;
    private String paymentLink;
    private String qrCodeData;
    private Double amount;
    private String status;
    private LocalDateTime expiresAt;
    private String message;
}
