package com.upi.gateway.backend.service;

import com.upi.gateway.backend.dto.MerchantLoginRequest;
import com.upi.gateway.backend.dto.MerchantLoginResponse;
import com.upi.gateway.backend.dto.MerchantRegisterRequest;
import com.upi.gateway.backend.model.Merchant;
import com.upi.gateway.backend.repository.MerchantRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MerchantService {

    private final MerchantRepository merchantRepository;

    public MerchantService(MerchantRepository merchantRepository) {
        this.merchantRepository = merchantRepository;
    }

    public Merchant register(MerchantRegisterRequest request) {

        merchantRepository.findByEmail(request.getEmail())
                .ifPresent(m -> {
                    throw new RuntimeException("Merchant already exists");
                });

        // NOTE: In a production environment, password should be hashed (e.g., using BCrypt).
        // For this sandbox, we store it as plain text.
        Merchant merchant = Merchant.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .businessName(request.getBusinessName())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        return merchantRepository.save(merchant);
    }

    public MerchantLoginResponse login(MerchantLoginRequest request) {
        Merchant merchant = merchantRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!merchant.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!merchant.isActive()) {
            throw new RuntimeException("Merchant is not active");
        }

        return new MerchantLoginResponse(merchant.getId(), "Login successful");
    }
}
