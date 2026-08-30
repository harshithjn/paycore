package com.upi.gateway.backend.strategy;

import com.upi.gateway.backend.model.Settlement;

import java.util.List;

public interface ReportGenerator {

    boolean supports(String format);

    String generateReport(List<Settlement> settlements, Long merchantId);

    String getContentType();
}
