package com.upi.gateway.backend.strategy;

import com.upi.gateway.backend.model.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface SettlementCalculator {

    boolean supports(String type);

    BigDecimal calculate(List<Transaction> transactions);

    LocalDateTime[] getPeriodBoundaries();
}
