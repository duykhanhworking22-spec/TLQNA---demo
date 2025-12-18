package com.hoidap.hoidapdemo.infrastructure.adapter.web.controller.api.lop;

import com.hoidap.hoidapdemo.application.port.LopServicePort;
import com.hoidap.hoidapdemo.infrastructure.adapter.web.common.AppStatus;
import com.hoidap.hoidapdemo.infrastructure.adapter.web.dto.common.ApiResponse;
import com.hoidap.hoidapdemo.infrastructure.adapter.web.dto.lop.CreateLopRequest;
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
    private final LopServicePort lopService;

    public LopController(LopServicePort lopService) {
        this.lopService = lopService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Void>> createLop(@Valid @RequestBody CreateLopRequest request) {
        lopService.createLop(request);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(AppStatus.SUCCESS.getCode())
                .message("Tạo lớp thành công: " + request.getMaLop())
                .build());
    }

    @org.springframework.web.bind.annotation.GetMapping
    public ResponseEntity<ApiResponse<List<String>>> getClasses() {
        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .status(AppStatus.SUCCESS.getCode())
                .message("Danh sách mã lớp")
                .data(lopService.getAllMaLop())
                .build());
    }

    @org.springframework.web.bind.annotation.GetMapping("/cohorts")
    public ResponseEntity<ApiResponse<List<String>>> getCohorts() {
        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .status(AppStatus.SUCCESS.getCode())
                .message("Danh sách khóa")
                .data(lopService.getAllKhoaHoc())
                .build());
    }

    @org.springframework.web.bind.annotation.GetMapping("/majors")
    public ResponseEntity<ApiResponse<List<String>>> getMajors() {
        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .status(AppStatus.SUCCESS.getCode())
                .message("Danh sách chuyên ngành")
                .data(lopService.getAllChuyenNganh())
                .build());
    }
}
