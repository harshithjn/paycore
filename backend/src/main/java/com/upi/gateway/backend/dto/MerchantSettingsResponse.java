package com.upi.gateway.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantSettingsResponse {
    private Long id;
    private String name;
    private String businessName;
    private String email;
    private String phone;
    private String webhookUrl;
    private String logoUrl;
    private String apiKey;
    private Boolean isActive;
}
