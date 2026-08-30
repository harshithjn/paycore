package com.upi.gateway.backend.service;

import com.upi.gateway.backend.dto.SettlementRequest;
import com.upi.gateway.backend.dto.SettlementResponse;
import com.upi.gateway.backend.manager.SettlementEngine;
import com.upi.gateway.backend.model.Settlement;
import com.upi.gateway.backend.model.SettlementTransaction;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.SettlementRepository;
import com.upi.gateway.backend.repository.SettlementTransactionRepository;
import com.upi.gateway.backend.repository.TransactionRepository;
import com.upi.gateway.backend.strategy.SettlementCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettlementService {

    private final TransactionRepository transactionRepository;
    private final SettlementRepository settlementRepository;
    private final SettlementTransactionRepository settlementTransactionRepository;
    private final List<SettlementCalculator> settlementCalculators;
    private final SettlementEngine settlementEngine;

    @Transactional
    public SettlementResponse processSettlement(SettlementRequest request) {
        log.info("Processing settlement request: {}", request);

        SettlementCalculator calculator = settlementCalculators.stream()
                .filter(c -> c.supports(request.getType()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported settlement type: " + request.getType()));

        LocalDateTime[] period = calculator.getPeriodBoundaries();
        LocalDateTime periodStart = period[0];
        LocalDateTime periodEnd = period[1];

        if (settlementRepository.existsByMerchantIdAndPeriodStartAndPeriodEnd(
                request.getMerchantId(), periodStart, periodEnd)) {
            throw new IllegalStateException("Settlement already exists for this period");
        }

        List<Transaction> eligibleTransactions = transactionRepository
                .findByMerchantIdAndStatusOrderByCreatedAtDesc(
                        request.getMerchantId(),
                        Transaction.TransactionStatus.SUCCESS
                )
                .stream()
                .filter(t -> !settlementTransactionRepository.existsByTransactionId(t.getId()))
                .filter(t -> t.getCreatedAt().isAfter(periodStart) && t.getCreatedAt().isBefore(periodEnd))
                .collect(Collectors.toList());

        if (eligibleTransactions.isEmpty()) {
            return SettlementResponse.builder()
                    .merchantId(request.getMerchantId())
                    .status("FAILED")
                    .message("No eligible transactions found for settlement")
                    .build();
        }

        BigDecimal grossAmount = calculator.calculate(eligibleTransactions);

        if (!settlementEngine.validateSettlement(grossAmount, eligibleTransactions)) {
            return SettlementResponse.builder()
                    .merchantId(request.getMerchantId())
                    .status("FAILED")
                    .message("Settlement validation failed")
                    .build();
        }

        BigDecimal netAmount = settlementEngine.calculateNetSettlement(grossAmount);

        Settlement settlement = Settlement.builder()
                .merchantId(request.getMerchantId())
                .amount(netAmount)
                .status(Settlement.SettlementStatus.COMPLETED)
                .type(Settlement.SettlementType.valueOf(request.getType().toUpperCase()))
                .transactionCount(eligibleTransactions.size())
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .referenceNumber(settlementEngine.generateReferenceNumber(request.getMerchantId(), request.getType()))
                .processedAt(LocalDateTime.now())
                .build();

        Settlement savedSettlement = settlementRepository.save(settlement);

        for (Transaction transaction : eligibleTransactions) {
            SettlementTransaction st = SettlementTransaction.builder()
                    .settlementId(savedSettlement.getId())
                    .transactionId(transaction.getId())
                    .build();
            settlementTransactionRepository.save(st);

            transaction.setStatus(Transaction.TransactionStatus.SETTLED);
            transactionRepository.save(transaction);
        }

        log.info("Settlement processed successfully: {}", savedSettlement.getId());

        BigDecimal platformFee = grossAmount.subtract(netAmount);

        return SettlementResponse.builder()
                .settlementId(savedSettlement.getId())
                .merchantId(savedSettlement.getMerchantId())
                .grossAmount(grossAmount.doubleValue())
                .netAmount(netAmount.doubleValue())
                .platformFee(platformFee.doubleValue())
                .status(savedSettlement.getStatus().name())
                .type(savedSettlement.getType().name())
                .transactionCount(savedSettlement.getTransactionCount())
                .periodStart(savedSettlement.getPeriodStart())
                .periodEnd(savedSettlement.getPeriodEnd())
                .referenceNumber(savedSettlement.getReferenceNumber())
                .createdAt(savedSettlement.getCreatedAt())
                .processedAt(savedSettlement.getProcessedAt())
                .message("Settlement processed successfully")
                .build();
    }

    public List<SettlementResponse> getSettlementsByMerchant(Long merchantId) {
        List<Settlement> settlements = settlementRepository.findByMerchantIdOrderByCreatedAtDesc(merchantId);

        return settlements.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SettlementResponse> getAllSettlements() {
        List<Settlement> settlements = settlementRepository.findAll();

        return settlements.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SettlementResponse getSettlementById(UUID settlementId) {
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new IllegalArgumentException("Settlement not found: " + settlementId));

        return mapToResponse(settlement);
    }

    private SettlementResponse mapToResponse(Settlement settlement) {
        return SettlementResponse.builder()
                .settlementId(settlement.getId())
                .merchantId(settlement.getMerchantId())
                .netAmount(settlement.getAmount().doubleValue())
                .status(settlement.getStatus().name())
                .type(settlement.getType().name())
                .transactionCount(settlement.getTransactionCount())
                .periodStart(settlement.getPeriodStart())
                .periodEnd(settlement.getPeriodEnd())
                .referenceNumber(settlement.getReferenceNumber())
                .createdAt(settlement.getCreatedAt())
                .processedAt(settlement.getProcessedAt())
                .build();
    }
}
