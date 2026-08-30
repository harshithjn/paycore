package com.upi.gateway.backend.controller;

import com.upi.gateway.backend.dto.SettlementRequest;
import com.upi.gateway.backend.dto.SettlementResponse;
import com.upi.gateway.backend.service.ReportService;
import com.upi.gateway.backend.service.SettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/settlement")
@RequiredArgsConstructor
@Slf4j
public class SettlementController {

    private final SettlementService settlementService;
    private final ReportService reportService;

    @PostMapping("/process")
    public ResponseEntity<?> processSettlement(@Valid @RequestBody SettlementRequest request) {
        try {
            log.info("Received settlement request for merchant: {}", request.getMerchantId());
            SettlementResponse response = settlementService.processSettlement(request);

            if ("FAILED".equals(response.getStatus())) {
                return ResponseEntity.badRequest().body(response);
            }

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Settlement validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    SettlementResponse.builder()
                            .message(e.getMessage())
                            .status("FAILED")
                            .build()
            );
        } catch (Exception e) {
            log.error("Error processing settlement", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    SettlementResponse.builder()
                            .message("Internal server error: " + e.getMessage())
                            .status("FAILED")
                            .build()
            );
        }
    }

    @GetMapping("/merchant/{merchantId}")
    public ResponseEntity<List<SettlementResponse>> getSettlementsByMerchant(@PathVariable Long merchantId) {
        List<SettlementResponse> settlements = settlementService.getSettlementsByMerchant(merchantId);
        return ResponseEntity.ok(settlements);
    }

    @GetMapping("/{settlementId}")
    public ResponseEntity<?> getSettlementById(@PathVariable UUID settlementId) {
        try {
            SettlementResponse settlement = settlementService.getSettlementById(settlementId);
            return ResponseEntity.ok(settlement);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/report")
    public ResponseEntity<String> downloadReport(
            @RequestParam Long merchantId,
            @RequestParam(defaultValue = "CSV") String format) {

        try {
            String report = reportService.generateSettlementReport(merchantId, format);
            String contentType = reportService.getContentType(format);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));

            String filename = String.format("settlement_report_%d.%s", merchantId, format.toLowerCase());
            headers.setContentDispositionFormData("attachment", filename);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(report);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
