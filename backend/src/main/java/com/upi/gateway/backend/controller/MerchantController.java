package com.upi.gateway.backend.controller;

import com.upi.gateway.backend.dto.MerchantRegisterRequest;
import com.upi.gateway.backend.dto.MerchantRegisterResponse;
import com.upi.gateway.backend.model.Merchant;
import com.upi.gateway.backend.service.MerchantService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/merchant")
public class MerchantController {

    private final MerchantService merchantService;

    public MerchantController(MerchantService merchantService) {
        this.merchantService = merchantService;
    }

    @PostMapping("/register")
    public MerchantRegisterResponse register(
            @Valid @RequestBody MerchantRegisterRequest request) {
        Merchant merchant = merchantService.register(request);
        return new MerchantRegisterResponse(
                merchant.getId(),
                "Merchant registered successfully");
    }
}
