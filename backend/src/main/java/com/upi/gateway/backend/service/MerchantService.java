package com.upi.gateway.backend.service;

import com.upi.gateway.backend.dto.MerchantLoginRequest;
import com.upi.gateway.backend.dto.MerchantLoginResponse;
import com.upi.gateway.backend.exception.AuthException;
import com.upi.gateway.backend.dto.MerchantRegisterRequest;
import com.upi.gateway.backend.dto.MerchantSettingsRequest;
import com.upi.gateway.backend.dto.MerchantSettingsResponse;
import com.upi.gateway.backend.model.Merchant;
import com.upi.gateway.backend.repository.MerchantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MerchantService {

    private final MerchantRepository merchantRepository;

    public Merchant register(MerchantRegisterRequest request) {

        merchantRepository.findByEmail(request.getEmail())
                .ifPresent(m -> {
                    throw new RuntimeException("Merchant already exists");
                });

        String apiKey = "pk_" + UUID.randomUUID().toString().replace("-", "");

        Merchant merchant = Merchant.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .businessName(request.getBusinessName())
                .phone(request.getPhone())
                .apiKey(apiKey)
                .isActive(true)
                .build();

        return merchantRepository.save(merchant);
    }

    public MerchantLoginResponse login(MerchantLoginRequest request) {
        Merchant merchant = merchantRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Invalid credentials"));

        if (!merchant.getPassword().equals(request.getPassword())) {
            throw new AuthException("Invalid credentials");
        }

        if (merchant.getIsActive() != null && !merchant.getIsActive()) {
            throw new AuthException("Merchant is not active");
        }

        return new MerchantLoginResponse(merchant.getId(), "Login successful");
    }

    public Optional<Merchant> findById(Long merchantId) {
        return merchantRepository.findById(merchantId);
    }

    @Transactional
    public boolean updateWebhookUrl(Long merchantId, String webhookUrl) {
        log.info("Updating webhook URL for merchant {} to: {}", merchantId, webhookUrl);

        Optional<Merchant> merchantOpt = merchantRepository.findById(merchantId);
        if (merchantOpt.isPresent()) {
            Merchant merchant = merchantOpt.get();
            merchant.setWebhookUrl(webhookUrl);
            merchantRepository.save(merchant);

            log.info("Successfully updated webhook URL for merchant {}", merchantId);
            return true;
        }

        log.warn("Merchant not found with ID: {}", merchantId);
        return false;
    }

    public MerchantSettingsResponse getSettings(Long merchantId) {
        Merchant merchant = merchantRepository.findById(merchantId)
                .orElseThrow(() -> new IllegalArgumentException("Merchant not found"));

        return MerchantSettingsResponse.builder()
                .id(merchant.getId())
                .name(merchant.getName())
                .businessName(merchant.getBusinessName())
                .email(merchant.getEmail())
                .phone(merchant.getPhone())
                .webhookUrl(merchant.getWebhookUrl())
                .logoUrl(merchant.getLogoUrl())
                .apiKey(merchant.getApiKey())
                .isActive(merchant.getIsActive())
                .build();
    }

    @Transactional
    public MerchantSettingsResponse updateSettings(Long merchantId, MerchantSettingsRequest request) {
        Merchant merchant = merchantRepository.findById(merchantId)
                .orElseThrow(() -> new IllegalArgumentException("Merchant not found"));

        if (request.getBusinessName() != null) {
            merchant.setBusinessName(request.getBusinessName());
        }
        if (request.getEmail() != null) {
            merchant.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            merchant.setPhone(request.getPhone());
        }
        if (request.getWebhookUrl() != null) {
            merchant.setWebhookUrl(request.getWebhookUrl());
        }
        if (request.getLogoUrl() != null) {
            merchant.setLogoUrl(request.getLogoUrl());
        }

        merchantRepository.save(merchant);

        return getSettings(merchantId);
    }

    public Optional<Merchant> findByApiKey(String apiKey) {
        return merchantRepository.findByApiKey(apiKey);
    }

    @Transactional
    public String regenerateApiKey(Long merchantId) {
        Merchant merchant = merchantRepository.findById(merchantId)
                .orElseThrow(() -> new IllegalArgumentException("Merchant not found"));

        String newApiKey = "pk_" + UUID.randomUUID().toString().replace("-", "");
        merchant.setApiKey(newApiKey);
        merchantRepository.save(merchant);

        log.info("Regenerated API key for merchant {}", merchantId);
        return newApiKey;
    }

}
