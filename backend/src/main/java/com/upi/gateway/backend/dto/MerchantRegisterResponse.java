package com.upi.gateway.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MerchantRegisterResponse {
    private Long merchantId;
    private String message;
}
