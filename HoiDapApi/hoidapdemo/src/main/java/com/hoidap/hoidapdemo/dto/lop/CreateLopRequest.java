package com.hoidap.hoidapdemo.dto.lop;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateLopRequest {
    @NotBlank(message = "MÃ£ lá»›p khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String maLop;

    private String khoaHoc;
    private String chuyenNganh;

    private String maCvht;
}

