package com.upi.gateway.backend.controller;

import com.upi.gateway.backend.dto.MerchantLoginRequest;
import com.upi.gateway.backend.dto.MerchantLoginResponse;
import com.upi.gateway.backend.dto.MerchantRegisterRequest;
import com.upi.gateway.backend.dto.MerchantRegisterResponse;
import com.upi.gateway.backend.model.Merchant;
import com.upi.gateway.backend.service.MerchantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/merchant")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class MerchantController {

    private final MerchantService merchantService;

    @PostMapping("/register")
    public MerchantRegisterResponse register(
            @Valid @RequestBody MerchantRegisterRequest request) {
        Merchant merchant = merchantService.register(request);
        return new MerchantRegisterResponse(
                merchant.getId(),
                "Merchant registered successfully");
    }

    @PostMapping("/login")
    public MerchantLoginResponse login(@Valid @RequestBody MerchantLoginRequest request) {
        return merchantService.login(request);
    }
    
    /**
     * Get merchant details including webhook URL
     */
    @GetMapping("/{merchantId}")
    public ResponseEntity<Merchant> getMerchant(@PathVariable Long merchantId) {
        log.info("Fetching merchant details for ID: {}", merchantId);
        
        Optional<Merchant> merchant = merchantService.findById(merchantId);
        return merchant.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update merchant webhook URL
     */
    @PutMapping("/{merchantId}/webhook")
    public ResponseEntity<Map<String, String>> updateWebhookUrl(
            @PathVariable Long merchantId,
            @RequestBody Map<String, String> request) {
        
        log.info("Updating webhook URL for merchant: {}", merchantId);
        
        String webhookUrl = request.get("webhookUrl");
        boolean updated = merchantService.updateWebhookUrl(merchantId, webhookUrl);
        
        if (updated) {
            return ResponseEntity.ok(Map.of(
                "message", "Webhook URL updated successfully",
                "webhookUrl", webhookUrl != null ? webhookUrl : ""
            ));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get merchant webhook URL
     */
    @GetMapping("/{merchantId}/webhook")
    public ResponseEntity<Map<String, String>> getWebhookUrl(@PathVariable Long merchantId) {
        log.info("Fetching webhook URL for merchant: {}", merchantId);
        
        Optional<Merchant> merchant = merchantService.findById(merchantId);
        if (merchant.isPresent()) {
            return ResponseEntity.ok(Map.of(
                "webhookUrl", merchant.get().getWebhookUrl() != null ? merchant.get().getWebhookUrl() : ""
            ));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
