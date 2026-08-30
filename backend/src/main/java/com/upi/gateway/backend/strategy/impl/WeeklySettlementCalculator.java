package com.upi.gateway.backend.strategy.impl;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.strategy.SettlementCalculator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Component
@Slf4j
public class WeeklySettlementCalculator implements SettlementCalculator {

    @Override
    public boolean supports(String type) {
        return "WEEKLY".equalsIgnoreCase(type);
    }

    @Override
    public BigDecimal calculate(List<Transaction> transactions) {
        log.info("Calculating WEEKLY settlement for {} transactions", transactions.size());

        return transactions.stream()
                .filter(t -> t.getStatus() == Transaction.TransactionStatus.SUCCESS)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public LocalDateTime[] getPeriodBoundaries() {
        LocalDate today = LocalDate.now();
        LocalDate lastMonday = today.with(TemporalAdjusters.previous(DayOfWeek.MONDAY)).minusWeeks(1);
        LocalDate lastSunday = lastMonday.plusDays(6);

        LocalDateTime start = lastMonday.atStartOfDay();
        LocalDateTime end = lastSunday.atTime(LocalTime.MAX);

        return new LocalDateTime[]{start, end};
    }
}
