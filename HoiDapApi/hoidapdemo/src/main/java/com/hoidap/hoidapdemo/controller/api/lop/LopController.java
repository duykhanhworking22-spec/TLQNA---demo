package com.hoidap.hoidapdemo.controller.api.lop;

import com.hoidap.hoidapdemo.service.LopServiceImpl;
import com.hoidap.hoidapdemo.utils.AppStatus;
import com.hoidap.hoidapdemo.dto.common.ApiResponse;
import com.hoidap.hoidapdemo.dto.lop.CreateLopRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class LopController {
    private final LopServiceImpl lopService;

    public LopController(LopServiceImpl lopService) {
        this.lopService = lopService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Void>> createLop(@Valid @RequestBody CreateLopRequest request) {
        lopService.createLop(request);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(AppStatus.SUCCESS.getCode())
                .message("Táº¡o lá»›p thÃ nh cÃ´ng: " + request.getMaLop())
                .build());
    }

    @org.springframework.web.bind.annotation.GetMapping
    public ResponseEntity<ApiResponse<List<String>>> getClasses() {
        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .status(AppStatus.SUCCESS.getCode())
                .message("Danh sÃ¡ch mÃ£ lá»›p")
                .data(lopService.getAllMaLop())
                .build());
    }

    @org.springframework.web.bind.annotation.GetMapping("/cohorts")
    public ResponseEntity<ApiResponse<List<String>>> getCohorts() {
        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .status(AppStatus.SUCCESS.getCode())
                .message("Danh sÃ¡ch khÃ³a")
                .data(lopService.getAllKhoaHoc())
                .build());
    }

    @org.springframework.web.bind.annotation.GetMapping("/majors")
    public ResponseEntity<ApiResponse<List<String>>> getMajors() {
        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .status(AppStatus.SUCCESS.getCode())
                .message("Danh sÃ¡ch chuyÃªn ngÃ nh")
                .data(lopService.getAllChuyenNganh())
                .build());
    }
}
