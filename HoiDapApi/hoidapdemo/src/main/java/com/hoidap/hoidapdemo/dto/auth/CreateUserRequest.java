package com.hoidap.hoidapdemo.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateUserRequest {
    @NotBlank(message = "MÃ£ Ä‘á»‹nh danh (MÃ£ SV/CV) khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String maDinhDanh;

    @NotBlank(message = "Email khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Email(message = "Email khÃ´ng Ä‘Ãºng Ä‘á»‹nh dáº¡ng")
    private String email;
}

