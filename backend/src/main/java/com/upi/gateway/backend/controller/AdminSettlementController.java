package com.upi.gateway.backend.controller;

import com.upi.gateway.backend.dto.SettlementRequest;
import com.upi.gateway.backend.dto.SettlementResponse;
import com.upi.gateway.backend.service.SettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/settlements")
@RequiredArgsConstructor
@Slf4j
public class AdminSettlementController {

    private final SettlementService settlementService;

    @GetMapping
    public ResponseEntity<List<SettlementResponse>> getAllSettlements() {
        log.info("Admin: Fetching all settlements");
        List<SettlementResponse> settlements = settlementService.getAllSettlements();
        return ResponseEntity.ok(settlements);
    }

    @PostMapping("/trigger")
    public ResponseEntity<?> triggerSettlement(@Valid @RequestBody SettlementRequest request) {
        try {
            log.info("Admin: Manually triggering settlement for merchant: {}", request.getMerchantId());
            SettlementResponse response = settlementService.processSettlement(request);

            if ("FAILED".equals(response.getStatus())) {
                return ResponseEntity.badRequest().body(response);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Admin: Error triggering settlement", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    SettlementResponse.builder()
                            .message("Error: " + e.getMessage())
                            .status("FAILED")
                            .build()
            );
        }
    }
}
