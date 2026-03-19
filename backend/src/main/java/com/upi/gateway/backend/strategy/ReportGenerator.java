package com.upi.gateway.backend.strategy;

import com.upi.gateway.backend.model.Settlement;

import java.util.List;

/**
 * Interface Segregation Principle (ISP):
 * Clean interface for report generation
 */
public interface ReportGenerator {
    
    /**
     * Check if this generator supports the given format
     */
    boolean supports(String format);
    
    /**
     * Generate report from settlements
     */
    String generateReport(List<Settlement> settlements, Long merchantId);
    
    /**
     * Get content type for HTTP response
     */
    String getContentType();
}
