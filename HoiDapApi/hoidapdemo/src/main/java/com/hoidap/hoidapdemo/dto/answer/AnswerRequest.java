package com.hoidap.hoidapdemo.dto.answer;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class AnswerRequest {
    @NotBlank(message = "Ná»™i dung tráº£ lá»i khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String noiDung;

    private MultipartFile file;
}

