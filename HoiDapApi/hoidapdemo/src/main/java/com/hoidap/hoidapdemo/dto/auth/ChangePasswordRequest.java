package com.hoidap.hoidapdemo.dto.auth;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class ChangePasswordRequest {
    @NotBlank
    private String currentPassword;

    @NotBlank
    @Size(min = 6, message = "Máº­t kháº©u má»›i pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±")
    private String newPassword;
}

