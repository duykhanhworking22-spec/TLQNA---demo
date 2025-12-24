package com.hoidap.hoidapdemo.dto.auth;

import com.hoidap.hoidapdemo.entity.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String email;

    @NotBlank(message = "Máº­t kháº©u khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Size(min = 6, message = "Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±")
    private String password;

    @NotNull(message = "Vai trÃ² (Role) lÃ  báº¯t buá»™c")
    private UserRole role;

    @NotBlank(message = "Há» tÃªn khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String hoTen;

    @NotBlank(message = "Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng") // TÃ¹y chá»n validate
    private String soDienThoai;

    private String maLop;
    private String khoa;

    private String chuyenNganh;
}

