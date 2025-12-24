package com.hoidap.hoidapdemo.controller.api;

import com.hoidap.hoidapdemo.service.UserServiceImpl;
import com.hoidap.hoidapdemo.dto.auth.AuthResponse;
import com.hoidap.hoidapdemo.dto.auth.LoginRequest;
import com.hoidap.hoidapdemo.dto.user.ProfileUpdateRequest;
import org.springframework.http.ResponseEntity;
import com.hoidap.hoidapdemo.utils.AppStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Quáº£n lÃ½ ÄÄƒng kÃ½, ÄÄƒng nháº­p")
public class AuthController {
    private final UserServiceImpl userService;

    public AuthController(UserServiceImpl userService) {
        this.userService = userService;
    }

    // @PostMapping("/register")
    // @Operation(summary = "ÄÄƒng kÃ½")
    // public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody
    // RegisterRequest request) {
    // String userId = userService.register(
    // request.getEmail(),
    // request.getPassword(),
    // request.getHoTen(),
    // request.getSoDienThoai(),
    // request.getRole()
    // );
    //
    // AuthResponse response = AuthResponse.builder()
    // .status(AppStatus.SUCCESS.getCode())
    // .message(AppStatus.SUCCESS.getMessage())
    // .build();
    // return ResponseEntity.ok(response);
    // }

    @PostMapping("/login")
    @Operation(summary = "ÄÄƒng nháº­p")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            String token = userService.login(request.getEmail(), request.getPassword());

            AuthResponse response = AuthResponse.builder()
                    .status(AppStatus.SUCCESS.getCode())
                    .message("ÄÄƒng nháº­p thÃ nh cÃ´ng")
                    .token(token)
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                    AuthResponse.builder()
                            .status(401)
                            .message("ÄÄƒng nháº­p tháº¥t báº¡i: " + e.getMessage())
                            .build());
        }
    }

    @PostMapping("/password/change")
    @Operation(summary = "Äá»•i máº­t kháº©u")
    public ResponseEntity<AuthResponse> changePassword(
            @Valid @RequestBody com.hoidap.hoidapdemo.dto.auth.ChangePasswordRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        try {
            userService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());

            return ResponseEntity.ok(AuthResponse.builder()
                    .status(AppStatus.SUCCESS.getCode())
                    .message("Äá»•i máº­t kháº©u thÃ nh cÃ´ng")
                    .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(AuthResponse.builder()
                    .status(AppStatus.MISSING_VALUE.getCode())
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(AuthResponse.builder()
                    .status(AppStatus.INTERNAL_ERROR.getCode())
                    .message(AppStatus.INTERNAL_ERROR.getMessage())
                    .build());
        }
    }

    @PostMapping("/profile/update")
    @Operation(summary = "Cáº­p nháº­t thÃ´ng tin")
    public ResponseEntity<AuthResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        try {
            userService.updateProfile(email, request);

            return ResponseEntity.ok(AuthResponse.builder()
                    .status(AppStatus.SUCCESS.getCode())
                    .message(AppStatus.SUCCESS.getMessage())
                    .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(AuthResponse.builder()
                    .status(AppStatus.MISSING_VALUE.getCode())
                    .message(AppStatus.MISSING_VALUE.getMessage() + " " + e.getMessage())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(AuthResponse.builder()
                    .status(AppStatus.INTERNAL_ERROR.getCode())
                    .message(AppStatus.INTERNAL_ERROR.getMessage())
                    .build());
        }
    }
}
