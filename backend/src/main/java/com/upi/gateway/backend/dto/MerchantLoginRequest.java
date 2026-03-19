package com.upi.gateway.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MerchantLoginRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}
