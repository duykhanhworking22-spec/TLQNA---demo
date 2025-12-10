package com.hoidap.hoidapdemo.infrastructure.adapter.web.dto.user;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private String maDinhDanh;
    private String hoTen;
    private String email;
    private String role;
    private String soDienThoai;
    private String maLop;
    private String chuyenMon;
    private String cvhtMa;
    private String cvhtHoTen;
}
