package com.upi.gateway.backend.service;

import com.upi.gateway.backend.dto.MerchantLoginRequest;
import com.upi.gateway.backend.dto.MerchantLoginResponse;
import com.upi.gateway.backend.dto.MerchantRegisterRequest;
import com.upi.gateway.backend.model.Merchant;
import com.upi.gateway.backend.repository.MerchantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

        // Generate API key for the merchant
        String apiKey = "pk_" + UUID.randomUUID().toString().replace("-", "");

        // NOTE: In a production environment, password should be hashed (e.g., using BCrypt).
        // For this sandbox, we store it as plain text.
        Merchant merchant = Merchant.builder()
                .name(request.getName())
                .email(request.getEmail())
                .apiKey(apiKey)
                .isActive(true)
                .build();

        return merchantRepository.save(merchant);
    }

    public MerchantLoginResponse login(MerchantLoginRequest request) {
        Merchant merchant = merchantRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!merchant.getIsActive()) {
            throw new RuntimeException("Merchant is not active");
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
}
