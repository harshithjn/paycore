package com.upi.gateway.backend.service;

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

        Merchant merchant = Merchant.builder()
                .name(request.getName())
                .email(request.getEmail())
                .businessName(request.getBusinessName())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        return merchantRepository.save(merchant);
    }
}
