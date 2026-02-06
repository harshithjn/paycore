package com.upi.gateway.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MerchantRegisterRequest {

    @NotBlank
    private String name;

    @Email
    private String email;

    @NotBlank
    private String businessName;
}
