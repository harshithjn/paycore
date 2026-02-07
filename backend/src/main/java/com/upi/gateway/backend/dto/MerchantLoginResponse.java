package com.upi.gateway.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MerchantLoginResponse {
    private Long merchantId;
    private String message;
}
