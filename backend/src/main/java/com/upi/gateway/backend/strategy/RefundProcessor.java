package com.upi.gateway.backend.strategy;

import com.upi.gateway.backend.model.Refund;
import com.upi.gateway.backend.model.Transaction;

import java.math.BigDecimal;

public interface RefundProcessor {

    boolean supports(String type);

    Refund processRefund(Transaction transaction, BigDecimal amount, String reason);
}
