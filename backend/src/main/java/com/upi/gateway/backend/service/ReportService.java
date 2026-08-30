package com.upi.gateway.backend.service;

import com.upi.gateway.backend.model.Settlement;
import com.upi.gateway.backend.repository.SettlementRepository;
import com.upi.gateway.backend.strategy.ReportGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final SettlementRepository settlementRepository;
    private final List<ReportGenerator> reportGenerators;

    public String generateSettlementReport(Long merchantId, String format) {
        log.info("Generating {} report for merchant: {}", format, merchantId);

        ReportGenerator generator = reportGenerators.stream()
                .filter(g -> g.supports(format))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported report format: " + format));

        List<Settlement> settlements = settlementRepository.findByMerchantIdOrderByCreatedAtDesc(merchantId);

        if (settlements.isEmpty()) {
            log.warn("No settlements found for merchant: {}", merchantId);
        }

        return generator.generateReport(settlements, merchantId);
    }

    public String getContentType(String format) {
        ReportGenerator generator = reportGenerators.stream()
                .filter(g -> g.supports(format))
                .findFirst()
                .orElse(null);

        return generator != null ? generator.getContentType() : "text/plain";
    }
}
