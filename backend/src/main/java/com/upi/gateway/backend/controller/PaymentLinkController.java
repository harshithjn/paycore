package com.upi.gateway.backend.controller;

import com.upi.gateway.backend.model.ApiRequestLog;
import com.upi.gateway.backend.model.Merchant;
import com.upi.gateway.backend.model.PaymentLink;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.service.MerchantService;
import com.upi.gateway.backend.service.PaymentLinkService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PaymentLinkController {

    private final PaymentLinkService paymentLinkService;
    private final MerchantService merchantService;

    @org.springframework.beans.factory.annotation.Value("${payment.link.base-url:}")
    private String baseUrl;

    @PostMapping("/v1/payment-links")
    public ResponseEntity<?> createLinkViaApi(
            @RequestHeader("X-Api-Key") String apiKey,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        Merchant merchant = merchantService.findByApiKey(apiKey)
                .orElse(null);

        if (merchant == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid API key"));
        }

        try {
            String title = (String) body.get("title");
            String description = (String) body.getOrDefault("description", "");
            BigDecimal amount = new BigDecimal(body.get("amount").toString());
            boolean isReusable = (boolean) body.getOrDefault("isReusable", true);

            PaymentLink link = paymentLinkService.createLink(merchant.getId(), title, description, amount, isReusable);

            String payUrl;
            if (baseUrl != null && !baseUrl.isEmpty()) {
                payUrl = baseUrl + (baseUrl.endsWith("/") ? "" : "/") + "pay/link/" + link.getLinkCode();
            } else {
                payUrl = request.getScheme() + "://" + request.getServerName()
                        + (request.getServerPort() != 80 && request.getServerPort() != 443 ? ":" + request.getServerPort() : "")
                        + "/pay/link/" + link.getLinkCode();
            }

            Map<String, Object> response = Map.of(
                    "id", link.getId(),
                    "linkCode", link.getLinkCode(),
                    "title", link.getTitle(),
                    "amount", link.getAmount(),
                    "paymentUrl", payUrl,
                    "status", link.getStatus(),
                    "isReusable", link.getIsReusable()
            );

            paymentLinkService.logApiRequest(merchant.getId(), apiKey, "POST", "/api/v1/payment-links",
                    200, body.toString(), "Link created: " + link.getLinkCode(), request.getRemoteAddr());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            paymentLinkService.logApiRequest(merchant.getId(), apiKey, "POST", "/api/v1/payment-links",
                    400, body.toString(), "Error: " + e.getMessage(), request.getRemoteAddr());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/v1/payment-links")
    public ResponseEntity<?> listLinksViaApi(
            @RequestHeader("X-Api-Key") String apiKey,
            HttpServletRequest request) {

        Merchant merchant = merchantService.findByApiKey(apiKey).orElse(null);
        if (merchant == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid API key"));
        }

        List<PaymentLink> links = paymentLinkService.getMerchantLinks(merchant.getId());

        paymentLinkService.logApiRequest(merchant.getId(), apiKey, "GET", "/api/v1/payment-links",
                200, null, "Listed " + links.size() + " links", request.getRemoteAddr());

        return ResponseEntity.ok(links);
    }

    @PatchMapping("/v1/payment-links/{linkCode}/toggle")
    public ResponseEntity<?> toggleLinkViaApi(
            @RequestHeader("X-Api-Key") String apiKey,
            @PathVariable String linkCode,
            HttpServletRequest request) {

        Merchant merchant = merchantService.findByApiKey(apiKey).orElse(null);
        if (merchant == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid API key"));
        }

        try {
            PaymentLink link = paymentLinkService.toggleStatus(linkCode, merchant.getId());

            paymentLinkService.logApiRequest(merchant.getId(), apiKey, "PATCH",
                    "/api/v1/payment-links/" + linkCode + "/toggle",
                    200, null, "Toggled to: " + link.getStatus(), request.getRemoteAddr());

            return ResponseEntity.ok(link);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/v1/payment-links/{linkCode}")
    public ResponseEntity<?> getLinkPublic(@PathVariable String linkCode) {
        try {
            PaymentLink link = paymentLinkService.getLinkByCode(linkCode);
            Merchant merchant = merchantService.findById(link.getMerchantId()).orElse(null);

            return ResponseEntity.ok(Map.of(
                    "linkCode", link.getLinkCode(),
                    "title", link.getTitle(),
                    "description", link.getDescription() != null ? link.getDescription() : "",
                    "amount", link.getAmount(),
                    "currency", link.getCurrency(),
                    "status", link.getStatus(),
                    "merchantName", merchant != null ? merchant.getName() : "Unknown",
                    "isReusable", link.getIsReusable(),
                    "paymentCount", link.getPaymentCount()
            ));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/v1/payment-links/{linkCode}/pay")
    public ResponseEntity<?> payViaLink(
            @PathVariable String linkCode,
            @RequestBody Map<String, String> body) {
        try {
            String paymentMethod = body.getOrDefault("paymentMethod", "UPI");
            String customerEmail = body.get("customerEmail");
            String customerPhone = body.get("customerPhone");

            Transaction txn = paymentLinkService.processPayment(linkCode, paymentMethod, customerEmail, customerPhone);

            return ResponseEntity.ok(Map.of(
                    "transactionId", txn.getId(),
                    "status", txn.getStatus(),
                    "amount", txn.getAmount(),
                    "paymentMethod", txn.getPaymentMethod(),
                    "message", "Payment successful"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/merchant/{merchantId}/payment-links")
    public ResponseEntity<List<PaymentLink>> getMerchantLinks(@PathVariable Long merchantId) {
        return ResponseEntity.ok(paymentLinkService.getMerchantLinks(merchantId));
    }

    @PostMapping("/merchant/{merchantId}/payment-links")
    public ResponseEntity<?> createLinkFromDashboard(
            @PathVariable Long merchantId,
            @RequestBody Map<String, Object> body) {
        try {
            String title = (String) body.get("title");
            String description = (String) body.getOrDefault("description", "");
            BigDecimal amount = new BigDecimal(body.get("amount").toString());
            boolean isReusable = (boolean) body.getOrDefault("isReusable", true);

            PaymentLink link = paymentLinkService.createLink(merchantId, title, description, amount, isReusable);
            return ResponseEntity.ok(link);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/merchant/{merchantId}/payment-links/{linkCode}/toggle")
    public ResponseEntity<?> toggleLinkFromDashboard(
            @PathVariable Long merchantId,
            @PathVariable String linkCode) {
        try {
            PaymentLink link = paymentLinkService.toggleStatus(linkCode, merchantId);
            return ResponseEntity.ok(link);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/merchant/{merchantId}/api-logs")
    public ResponseEntity<List<ApiRequestLog>> getApiLogs(@PathVariable Long merchantId) {
        return ResponseEntity.ok(paymentLinkService.getApiLogs(merchantId));
    }
}
