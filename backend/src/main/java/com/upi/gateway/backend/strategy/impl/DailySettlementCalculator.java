package com.upi.gateway.backend.strategy.impl;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.strategy.SettlementCalculator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@Slf4j
public class DailySettlementCalculator implements SettlementCalculator {

    @Override
    public boolean supports(String type) {
        return "DAILY".equalsIgnoreCase(type);
    }

    @Override
    public BigDecimal calculate(List<Transaction> transactions) {
        log.info("Calculating DAILY settlement for {} transactions", transactions.size());

        return transactions.stream()
                .filter(t -> t.getStatus() == Transaction.TransactionStatus.SUCCESS)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public LocalDateTime[] getPeriodBoundaries() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime start = yesterday.atStartOfDay();
        LocalDateTime end = yesterday.atTime(LocalTime.MAX);

        return new LocalDateTime[]{start, end};
    }
}
