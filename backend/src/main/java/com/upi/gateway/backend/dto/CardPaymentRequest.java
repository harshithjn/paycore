package com.upi.gateway.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.UUID;

@Data
public class CardPaymentRequest {

    @NotNull(message = "Transaction ID is required")
    private UUID transactionId;

    @NotNull(message = "Card number is required")
    @Pattern(regexp = "\\d{16}", message = "Card number must be 16 digits")
    private String cardNumber;

    @NotNull(message = "CVV is required")
    @Pattern(regexp = "\\d{3}", message = "CVV must be 3 digits")
    private String cvv;

    @NotNull(message = "Expiry month is required")
    private String expiryMonth;

    @NotNull(message = "Expiry year is required")
    private String expiryYear;

    @NotNull(message = "Cardholder name is required")
    private String cardholderName;
}
