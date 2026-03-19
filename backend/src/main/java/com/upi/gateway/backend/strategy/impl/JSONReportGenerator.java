package com.upi.gateway.backend.strategy.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.upi.gateway.backend.model.Settlement;
import com.upi.gateway.backend.strategy.ReportGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * LSP Implementation: JSON Report Generator
 */
@Component
@Slf4j
public class JSONReportGenerator implements ReportGenerator {
    
    private final ObjectMapper objectMapper;
    
    public JSONReportGenerator() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }
    
    @Override
    public boolean supports(String format) {
        return "JSON".equalsIgnoreCase(format);
    }
    
    @Override
    public String generateReport(List<Settlement> settlements, Long merchantId) {
        log.info("Generating JSON report for merchant: {}", merchantId);
        
        Map<String, Object> report = new HashMap<>();
        report.put("merchantId", merchantId);
        report.put("totalSettlements", settlements.size());
        report.put("settlements", settlements);
        
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(report);
        } catch (JsonProcessingException e) {
            log.error("Error generating JSON report", e);
            return "{\"error\": \"Failed to generate report\"}";
        }
    }
    
    @Override
    public String getContentType() {
        return "application/json";
    }
}
