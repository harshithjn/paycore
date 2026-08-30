package com.upi.gateway.backend.strategy.impl;

import com.upi.gateway.backend.model.Settlement;
import com.upi.gateway.backend.strategy.ReportGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@Slf4j
public class CSVReportGenerator implements ReportGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public boolean supports(String format) {
        return "CSV".equalsIgnoreCase(format);
    }

    @Override
    public String generateReport(List<Settlement> settlements, Long merchantId) {
        log.info("Generating CSV report for merchant: {}", merchantId);

        StringBuilder csv = new StringBuilder();

        csv.append("Settlement ID,Merchant ID,Amount,Status,Type,Transaction Count,Period Start,Period End,Reference Number,Created At,Processed At\n");

        for (Settlement settlement : settlements) {
            csv.append(settlement.getId()).append(",")
               .append(settlement.getMerchantId()).append(",")
               .append(settlement.getAmount()).append(",")
               .append(settlement.getStatus()).append(",")
               .append(settlement.getType()).append(",")
               .append(settlement.getTransactionCount()).append(",")
               .append(settlement.getPeriodStart() != null ? settlement.getPeriodStart().format(DATE_FORMATTER) : "").append(",")
               .append(settlement.getPeriodEnd() != null ? settlement.getPeriodEnd().format(DATE_FORMATTER) : "").append(",")
               .append(settlement.getReferenceNumber()).append(",")
               .append(settlement.getCreatedAt().format(DATE_FORMATTER)).append(",")
               .append(settlement.getProcessedAt() != null ? settlement.getProcessedAt().format(DATE_FORMATTER) : "")
               .append("\n");
        }

        return csv.toString();
    }

    @Override
    public String getContentType() {
        return "text/csv";
    }
}
