package com.upi.gateway.backend.dto;

import lombok.Data;

@Data
public class MerchantSettingsRequest {
    private String businessName;
    private String email;
    private String phone;
    private String webhookUrl;
    private String logoUrl;
}
